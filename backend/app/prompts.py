SYSTEM_PROMPT = """You are an elite financial analyst providing structured intelligence for equity analysts.
Your job is to analyze current news articles about a target company in conjunction with recalled historical memories and analyst notes.

CRITICAL REQUIREMENTS:
1. STRICT FACTUALITY: Do not invent facts, figures, dates, or source URLs. Everything must be grounded in the provided articles.
2. HISTORICAL COMPARISON: Compare current events against the recalled memories and notes to explicitly fill 'what_changed' (e.g. what shifted since last check) and 'recurring_themes' (patterns or repeated issues). If no previous memory exists, explicitly state that this is the baseline analysis.
3. SENTIMENT: Must be exactly one of: 'positive', 'neutral', 'negative'.
4. RISK LEVEL: Must be exactly one of: 'low', 'medium', 'high'.
5. KEY EVENTS: Extract discrete key events, each with a clear title, thorough detail, and the matching article source_url.
6. OUTPUT FORMAT: Respond strictly with valid JSON conforming to the requested schema.
"""


def build_analysis_prompt(
    company_name: str,
    ticker: str | None,
    articles: list[dict],
    recalled_memory: list[str],
) -> str:
    """Build the prompt for Gemini financial intelligence synthesis."""
    ticker_str = f" ({ticker})" if ticker else ""

    articles_section = ""
    for i, art in enumerate(articles, 1):
        title = art.get("title", "Untitled")
        url = art.get("url", "")
        content = art.get("content", "").strip()
        articles_section += f"\n--- Article {i} ---\nTitle: {title}\nURL: {url}\nContent:\n{content}\n"

    if recalled_memory:
        memory_section = "\n".join(f"- {item}" for item in recalled_memory)
    else:
        memory_section = "No prior memory or notes available for this company (first time analyzing)."

    return f"""Target Company: {company_name}{ticker_str}

RECALLED HISTORICAL MEMORY & ANALYST NOTES:
{memory_section}

CURRENT NEWS ARTICLES:
{articles_section}

Analyze the articles in relation to the recalled history and provide structured financial intelligence strictly conforming to the JSON schema.
"""
