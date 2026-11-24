import logging
import re
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from app.config import settings

logger = logging.getLogger("firecrawl_service")

# Blacklisted social and user-generated content domains
BLOCKED_SOCIAL_DOMAINS = {
    "x.com",
    "twitter.com",
    "facebook.com",
    "instagram.com",
    "youtube.com",
    "linkedin.com",
    "reddit.com",
    "pinterest.com",
    "tiktok.com",
}

# Stock-quote, ticker, and non-article paths / domains
BLOCKED_URL_PATTERNS = [
    "/quotes/",
    "/quote/",
    "/stockpricequote/",
    "/stocks/companyid",
    "/stock-price/",
    "/share-price/",
    "/markets/stocks/",
    "/equity/",
    "/overview/",
    "/chart/",
    "/financials/",
    "/balancesheet/",
    "/ratios/",
    "/peers/",
    "/live-share-price/",
    "/price-chart/",
]

BLOCKED_DOMAINS_AND_PATHS = [
    "cnbc.com/quotes",
    "moneycontrol.com/india/stockpricequote",
    "moneycontrol.com/stocks",
    "economictimes.indiatimes.com/stocks",
    "economictimes.indiatimes.com/markets/stocks",
    "tradingview.com",
    "screener.in",
    "finance.yahoo.com/quote",
    "marketwatch.com/investing/stock",
    "wsj.com/market-data/quotes",
    "investing.com/equities",
    "bloomberg.com/quote",
    "reuters.com/markets/companies",
    "google.com/finance/quote",
    "tickertape.in",
    "trendlyne.com",
    "bseindia.com",
    "nseindia.com",
    "groww.in/stocks",
    "zerodha.com",
    "upstox.com",
]

# Passed to Firecrawl itself so its news search does not spend all candidates
# on sources that are guaranteed to be rejected below.
SEARCH_EXCLUDED_DOMAINS = [
    *BLOCKED_SOCIAL_DOMAINS,
    "tradingview.com",
    "finance.yahoo.com",
    "marketwatch.com",
    "screener.in",
    "tickertape.in",
    "trendlyne.com",
    "bseindia.com",
    "nseindia.com",
    "groww.in",
    "zerodha.com",
    "upstox.com",
]


def is_unwanted_source(url: str) -> tuple[bool, str]:
    """Check if URL belongs to social media, stock quotes, or non-article ticker pages."""
    try:
        parsed = urllib.parse.urlparse(url)
        netloc = (parsed.netloc or "").lower()
        if ":" in netloc:
            netloc = netloc.split(":")[0]

        # 1. Social domains
        for blocked in BLOCKED_SOCIAL_DOMAINS:
            if netloc == blocked or netloc.endswith("." + blocked):
                return True, f"social domain ({netloc})"

        # 2. Blocked domain + path prefixes
        full_path = (netloc + parsed.path).lower()
        for dp in BLOCKED_DOMAINS_AND_PATHS:
            if dp in full_path:
                return True, f"stock-quote/ticker domain ({dp})"

        # 3. URL substrings
        url_lower = url.lower()
        for pattern in BLOCKED_URL_PATTERNS:
            if pattern in url_lower:
                return True, f"quote/ticker pattern '{pattern}'"

        # 4. News hubs and company/listing pages, rather than individual articles.
        path = urllib.parse.unquote(parsed.path or "").lower()
        if path.rstrip("/") == "/news" or re.search(r"/stocks/[^/]+/news/?$", path):
            return True, "news landing/listing page"
        if re.search(r"/company/[^/]+/$", path):
            return True, "company landing page"

        slug = path.rstrip("/").rsplit("/", 1)[-1]
        if not re.fullmatch(r"(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)+", slug):
            return True, "no article-style URL slug"

        return False, ""
    except Exception as e:
        return True, f"malformed url ({e})"


def parse_published_date(meta) -> tuple[datetime | None, str | None]:
    """Extract and parse published date from Firecrawl document metadata."""
    if not meta:
        return None, None

    date_str = None
    if isinstance(meta, dict):
        for key in [
            "article:published_time",
            "published_time",
            "og:article:published_time",
            "dc_date",
            "dc_terms_created",
            "modified_time",
            "og:updated_time",
        ]:
            if meta.get(key):
                date_str = meta.get(key)
                break
    else:
        for attr in [
            "article:published_time",
            "published_time",
            "og:article:published_time",
            "dc_date",
            "dc_terms_created",
            "modified_time",
            "og:updated_time",
        ]:
            val = getattr(meta, attr, None)
            if val:
                date_str = val
                break

    if not date_str:
        return None, None

    return parse_date_value(date_str)


def parse_date_value(date_str: object) -> tuple[datetime | None, str | None]:
    """Parse a date provided by document metadata or Firecrawl news search."""
    if not date_str:
        return None, None
    date_clean = str(date_str).strip()
    try:
        dt = datetime.fromisoformat(date_clean.replace("Z", "+00:00"))
        return dt, dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    try:
        dt = datetime.strptime(date_clean[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return dt, dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    for fmt in ("%d/%m/%Y-%H:%M:%S", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            dt = datetime.strptime(date_clean, fmt).replace(tzinfo=timezone.utc)
            return dt, dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None, date_clean[:10]


class FirecrawlService:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.FIRECRAWL_API_KEY
        self.last_timing: dict = {}

    def _scrape_single_candidate(
        self,
        app,
        item_dict: dict,
        min_content_length: int,
        max_content_length: int,
    ) -> dict:
        """Scrape a single candidate URL with timing and quality checks."""
        url = item_dict["url"]
        title = item_dict["title"]
        t0 = time.perf_counter()

        try:
            doc = app.scrape(url=url, formats=["markdown"])
            dur = time.perf_counter() - t0
            content = getattr(doc, "markdown", None) or getattr(doc, "summary", "") or ""
            content = content.strip()

            meta = getattr(doc, "metadata_dict", None) or getattr(doc, "metadata", None)
            pub_dt, pub_str = parse_published_date(meta)
            if not pub_dt:
                pub_dt, pub_str = parse_date_value(item_dict.get("published_date"))

            if not pub_dt:
                return {
                    "ok": False,
                    "url": url,
                    "title": title,
                    "reason": "no extractable publish date",
                    "duration": dur,
                }

            if len(content) < min_content_length:
                return {
                    "ok": False,
                    "url": url,
                    "title": title,
                    "reason": f"content too short ({len(content)} chars < {min_content_length} chars)",
                    "duration": dur,
                }

            trimmed = content[:max_content_length].strip()

            recent = False
            age_desc = "unknown date"
            if pub_dt:
                age_days = (datetime.now(timezone.utc) - pub_dt).days
                recent = 0 <= age_days <= 30
                age_desc = f"{age_days}d ago" + (" [RECENT <=30d]" if recent else " [ARCHIVE >30d]")

            return {
                "ok": True,
                "url": url,
                "title": title,
                "content": trimmed,
                "duration": dur,
                "published_date": pub_str,
                "is_recent": recent,
                "age_desc": age_desc,
            }
        except Exception as e:
            dur = time.perf_counter() - t0
            return {
                "ok": False,
                "url": url,
                "title": title,
                "reason": f"scrape failed ({e})",
                "duration": dur,
            }

    def scrape_company_news(
        self,
        company_name: str,
        ticker: str | None = None,
        max_articles: int = 3,
        max_content_length: int = 8000,
        min_content_length: int = 800,
        scrape_timeout_seconds: float = 12.0,
    ) -> list[dict]:
        """Search and scrape high-quality financial news in parallel.

        - Prefers news results over general web results
        - Skips social domains, stock-quote/ticker pages (cnbc, economictimes, screener, etc.)
        - Scrapes candidate articles concurrently in a thread pool
        - Extracts published date and prioritizes recent articles (<= 30 days)
        - Stops fetching once max_articles good articles are gathered
        - Logs kept and skipped URLs with timing and character counts
        """
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY is not set. Please provide an API key in .env.")

        from firecrawl import FirecrawlApp

        t_start_total = time.perf_counter()
        query = f"{company_name} latest financial news"
        search_limit = max(max_articles * 5, 15)
        logger.info(f"Firecrawl Search: '{query}' (candidate limit={search_limit})")

        t_search_start = time.perf_counter()
        try:
            app = FirecrawlApp(api_key=self.api_key)
            search_res = app.search(
                query=query,
                sources=["news"],
                tbs="qdr:m",
                exclude_domains=SEARCH_EXCLUDED_DOMAINS,
                limit=search_limit,
            )
        except Exception as e:
            logger.error(f"Firecrawl search failed: {e}", exc_info=True)
            raise RuntimeError(f"Firecrawl search failed: {e}") from e

        search_duration = time.perf_counter() - t_search_start
        logger.info(f"Firecrawl search finished in {search_duration:.2f}s")

        # The installed Firecrawl client supports sources=["news"] and tbs.
        # Prefer its news results; a time-filtered general search is only used
        # below if they cannot supply enough candidates after quality filtering.
        candidate_items = []
        if hasattr(search_res, "news") and search_res.news:
            candidate_items.extend(search_res.news)

        # Pre-filter candidate URLs to avoid wasting scraping calls on stock quotes or social media
        filtered_candidates = []
        seen_urls = set()
        def add_filtered_candidates(items) -> None:
            for item in items:
                url = getattr(item, "url", None)
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                unwanted, reason = is_unwanted_source(url)
                if unwanted:
                    logger.info(f"[SKIP] URL: {url} -> Reason: {reason}")
                    continue

                title = getattr(item, "title", None) or f"{company_name} News"
                filtered_candidates.append({
                    "url": url,
                    "title": title,
                    "published_date": getattr(item, "date", None),
                })

        add_filtered_candidates(candidate_items)

        if len(filtered_candidates) < max_articles:
            logger.info("News search produced %s viable candidates; trying time-filtered web fallback.", len(filtered_candidates))
            t_fallback_start = time.perf_counter()
            try:
                fallback_res = app.search(
                    query=query,
                    tbs="qdr:m",
                    exclude_domains=SEARCH_EXCLUDED_DOMAINS,
                    limit=search_limit,
                )
            except Exception as e:
                logger.warning("Firecrawl time-filtered web fallback failed: %s", e)
            else:
                search_duration += time.perf_counter() - t_fallback_start
                fallback_items = []
                if getattr(fallback_res, "news", None):
                    fallback_items.extend(fallback_res.news)
                if getattr(fallback_res, "web", None):
                    fallback_items.extend(fallback_res.web)
                add_filtered_candidates(fallback_items)

        logger.info(f"Found {len(filtered_candidates)} viable article candidates (out of {len(candidate_items)} search results).")

        # Parallel scraping with thread pool
        t_scrape_start = time.perf_counter()
        results: list[dict] = []
        # Take candidate items to scrape (up to max_articles + 1)
        candidates_to_scrape = filtered_candidates[: max(max_articles + 1, 4)]

        # Use up to 3 workers to respect rate limits while achieving fast parallel scraping
        with ThreadPoolExecutor(max_workers=min(len(candidates_to_scrape) or 1, 3)) as executor:
            future_to_item = {
                executor.submit(
                    self._scrape_single_candidate,
                    app,
                    cand,
                    min_content_length,
                    max_content_length,
                ): cand
                for cand in candidates_to_scrape
            }

            for future in as_completed(future_to_item):
                try:
                    res = future.result(timeout=scrape_timeout_seconds)
                except Exception as e:
                    cand = future_to_item[future]
                    logger.warning(f"[SKIP] URL: {cand['url']} -> Reason: scrape timeout/error ({e})")
                    continue

                if res["ok"]:
                    pub_str = res.get("published_date") or "Unknown"
                    age_info = res.get("age_desc") or ""
                    logger.info(
                        f"[KEEP] URL: {res['url']} -> Scraped {len(res['content'])} chars in {res['duration']:.2f}s "
                        f"(Published: {pub_str}, {age_info}) [Collected {len(results) + 1}/{max_articles}]"
                    )
                    results.append(res)
                    if len(results) >= max_articles:
                        # Got enough quality articles, cancel or ignore remaining
                        break
                else:
                    logger.info(f"[SKIP] URL: {res['url']} -> Reason: {res['reason']} (took {res.get('duration', 0):.2f}s)")

        scrape_duration = time.perf_counter() - t_scrape_start
        total_duration = time.perf_counter() - t_start_total

        self.last_timing = {
            "search_duration_s": round(search_duration, 2),
            "scrape_duration_s": round(scrape_duration, 2),
            "total_duration_s": round(total_duration, 2),
            "articles_count": len(results),
        }

        logger.info(
            f"Finished Firecrawl: Search={search_duration:.2f}s, Scrape={scrape_duration:.2f}s, "
            f"Total={total_duration:.2f}s, Collected {len(results)}/{max_articles} articles."
        )

        # Return list of articles formatted for pipeline
        return [
            {
                "url": r["url"],
                "title": r["title"],
                "content": r["content"],
                "published_date": r.get("published_date"),
            }
            for r in results
        ]


firecrawl_service = FirecrawlService()
