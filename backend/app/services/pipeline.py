import logging
import time
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Watchlist, Article, Analysis
from app.services.firecrawl_service import firecrawl_service
from app.services.memory_service import memory_service
from app.services.memory_ingestion import company_memory_coordinator
from app.services.llm_service import llm_service

logger = logging.getLogger("pipeline")


class PipelineService:
    def __init__(self):
        self.last_timing: dict = {}

    def run_analysis(
        self,
        db: Session,
        watchlist_id: int,
        max_articles: int | None = None,
    ) -> Analysis:
        """Execute the optimized intelligence analysis pipeline for a company.

        1) Fetch Watchlist entry from database
        2) Concurrently:
           a) Scrape recent financial news using Firecrawl (parallel article scraping)
           b) Recall prior scoped company memory and notes from Memento
        3) Synthesize with Gemini using strict JSON schema
        4) Store analysis and scraped articles in PostgreSQL
        5) Queue newly discovered events and summary for Memento ingestion
        6) Log detailed per-stage timing table
        """
        t_pipeline_start = time.perf_counter()

        # 1. Fetch Watchlist record
        watchlist = db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
        if not watchlist:
            raise ValueError(f"Watchlist entry with ID {watchlist_id} not found.")

        article_limit = max_articles or settings.MAX_ARTICLES or 3

        # 2. Concurrently execute Firecrawl and Memento recall
        logger.info(f"Starting concurrent news scraping and memory recall for '{watchlist.name}'...")
        scraped_articles = []
        recalled_memory = []
        t_recall = 0.0

        def do_scrape():
            return firecrawl_service.scrape_company_news(
                company_name=watchlist.name,
                ticker=watchlist.ticker,
                max_articles=article_limit,
            )

        def do_recall():
            nonlocal t_recall
            t0 = time.perf_counter()
            items = company_memory_coordinator.run_after_pending_ingest(
                watchlist.id,
                lambda: memory_service.get_items_for_company(
                    company_name=watchlist.name,
                    ticker=watchlist.ticker,
                ),
            )
            t_recall = time.perf_counter() - t0
            return items

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_scrape = executor.submit(do_scrape)
            future_recall = executor.submit(do_recall)

            # Await recall
            try:
                recalled_memory = future_recall.result()
                logger.info(f"Memento recall completed in {t_recall:.2f}s ({len(recalled_memory)} items found).")
            except Exception as e:
                logger.warning(f"Memento recall encountered an error: {e}. Proceeding with empty memory context.")
                recalled_memory = []

            # Await scrape
            try:
                scraped_articles = future_scrape.result()
            except Exception as e:
                logger.error(f"Firecrawl failed: {e}", exc_info=True)
                raise RuntimeError(f"Firecrawl service error: {e}") from e

        if not scraped_articles:
            raise RuntimeError(f"No news articles could be scraped for '{watchlist.name}'. Check API key or company query.")

        fc_timing = getattr(firecrawl_service, "last_timing", {})
        t_fc_search = fc_timing.get("search_duration_s", 0.0)
        t_fc_scrape = fc_timing.get("scrape_duration_s", 0.0)
        t_fc_total = fc_timing.get("total_duration_s", 0.0)

        # 3. Gemini: Generate Structured Analysis
        logger.info(f"Generating structured intelligence with Gemini for '{watchlist.name}'...")
        t_gemini_start = time.perf_counter()
        try:
            analysis_output = llm_service.analyze_news(
                company_name=watchlist.name,
                ticker=watchlist.ticker,
                articles=scraped_articles,
                recalled_memory=recalled_memory,
            )
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}", exc_info=True)
            raise RuntimeError(f"Gemini intelligence synthesis error: {e}") from e
        t_gemini = time.perf_counter() - t_gemini_start
        logger.info(f"Gemini synthesis completed in {t_gemini:.2f}s.")

        # 4. Save to Postgres
        t_db_start = time.perf_counter()
        # In the sources list returned to the frontend, include ONLY pages actually used as articles
        sources = [{"title": a["title"], "url": a["url"]} for a in scraped_articles]

        analysis_record = Analysis(
            watchlist_id=watchlist.id,
            headline=analysis_output.headline,
            summary=analysis_output.summary,
            key_events=[ev.model_dump() for ev in analysis_output.key_events],
            entities=analysis_output.entities,
            sentiment=analysis_output.sentiment,
            risk_level=analysis_output.risk_level,
            what_changed=analysis_output.what_changed,
            recurring_themes=[th.model_dump() for th in analysis_output.recurring_themes],
            sources=sources,
            memory_used=recalled_memory,
        )
        db.add(analysis_record)

        for art in scraped_articles:
            article_record = Article(
                watchlist_id=watchlist.id,
                url=art["url"],
                title=art["title"],
                content=art["content"],
            )
            db.add(article_record)

        db.commit()
        db.refresh(analysis_record)
        t_db = time.perf_counter() - t_db_start
        logger.info(f"PostgreSQL database save completed in {t_db:.2f}s.")

        # 5. Queue Memento ingestion after the durable Postgres save.  The
        # coordinator makes the task visible immediately, so a later recall
        # for this watchlist waits until the ingest has completed.
        def ingest_analysis() -> None:
            events_text = "\n".join(f"- {ev.title}: {ev.detail}" for ev in analysis_output.key_events)
            memento_payload = (
                f"[Company: {watchlist.name} | Ticker: {watchlist.ticker or 'N/A'}] Financial Intelligence Update\n"
                f"Headline: {analysis_output.headline}\n"
                f"Summary: {analysis_output.summary}\n"
                f"Sentiment: {analysis_output.sentiment}, Risk Level: {analysis_output.risk_level}\n"
                f"Key Events for {watchlist.name}:\n{events_text}"
            )
            memory_service.ingest_text(
                text=memento_payload,
                conversation_id=f"analysis_{analysis_record.id}",
                source_type="analysis",
                authority=0.95,
            )

        company_memory_coordinator.schedule_ingest(watchlist.id, ingest_analysis)
        logger.info("Queued background Memento ingestion (watchlist_id=%s, analysis_id=%s).", watchlist.id, analysis_record.id)

        # 6. Timing Report
        t_pipeline_total = time.perf_counter() - t_pipeline_start
        timing_report = {
            "firecrawl_search_s": round(t_fc_search, 2),
            "firecrawl_scrape_s": round(t_fc_scrape, 2),
            "firecrawl_total_s": round(t_fc_total, 2),
            "memento_recall_s": round(t_recall, 2),
            "gemini_call_s": round(t_gemini, 2),
            "db_save_s": round(t_db, 2),
            "memento_ingest_s": "background",
            "total_duration_s": round(t_pipeline_total, 2),
        }
        self.last_timing = timing_report

        timing_table = (
            f"\n"
            f"====================================================================\n"
            f"FINNEWS PIPELINE TIMING REPORT: {watchlist.name}\n"
            f"====================================================================\n"
            f"1. Firecrawl News Search           : {t_fc_search:6.2f} s\n"
            f"2. Parallel Article Scrapes        : {t_fc_scrape:6.2f} s ({len(scraped_articles)} articles)\n"
            f"   -> Total Firecrawl Time         : {t_fc_total:6.2f} s\n"
            f"3. Memento Recall (concurrent)     : {t_recall:6.2f} s ({len(recalled_memory)} items)\n"
            f"4. Gemini Intelligence Synthesis   : {t_gemini:6.2f} s\n"
            f"5. PostgreSQL Database Save        : {t_db:6.2f} s\n"
            f"6. Memento Knowledge Ingestion     : queued in background\n"
            f"--------------------------------------------------------------------\n"
            f"TOTAL PIPELINE DURATION            : {t_pipeline_total:6.2f} s (Target: < 60s)\n"
            f"===================================================================="
        )
        print(timing_table)
        logger.info(timing_table)

        return analysis_record


pipeline_service = PipelineService()
