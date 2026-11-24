SYSTEM_PROMPT = """You are an elite financial analyst providing structured intelligence for equity analysts.
Your job is to analyze current news articles about a target company in conjunction with recalled historical memories and analyst notes.

CRITICAL REQUIREMENTS:
1. STRICT FACTUALITY: Do not invent facts, figures, dates, or source URLs. Everything must be grounded in the provided articles. Never invent or hallucinate facts regarding analyst notes or memory.
2. HISTORICAL COMPARISON: Compare current events against the recalled memories and notes to explicitly fill 'what_changed' (e.g. what shifted since last check) and 'recurring_themes' (patterns or repeated issues). If no previous memory or notes exist, explicitly state that this is the baseline analysis.
3. ADDRESS ANALYST NOTES: You MUST explicitly address each analyst note listed under 'ANALYST NOTES (the analyst wants these tracked)' in 'what_changed' and/or 'recurring_themes':
   - For each tracked note, state what the current news articles show or clarify about that concern or topic.
   - If the new articles contain no relevant information on a given note, you must explicitly state that there is no new information or updates found in the latest articles.
   - NEVER invent facts.
4. SENTIMENT: Must be exactly one of: 'positive', 'neutral', 'negative'.
5. RISK LEVEL: Must be exactly one of: 'low', 'medium', 'high'.
6. KEY EVENTS: Extract discrete key events, each with a clear title, thorough detail, and the matching article source_url.
7. OUTPUT FORMAT: Respond strictly with valid JSON conforming to the requested schema.
"""


def build_analysis_prompt(
    company_name: str,
    ticker: str | None,
    articles: list[dict],
    recalled_memory: list[str],
    analyst_notes: list[str] | None = None,
) -> str:
    """Build the prompt for Gemini financial intelligence synthesis."""
    ticker_str = f" ({ticker})" if ticker else ""

    articles_section = ""
    for i, art in enumerate(articles, 1):
        title = art.get("title", "Untitled")
        url = art.get("url", "")
        content = art.get("content", "").strip()
        articles_section += f"\n--- Article {i} ---\nTitle: {title}\nURL: {url}\nContent:\n{content}\n"

    if analyst_notes:
        notes_section = "\n".join(f"- {note}" for note in analyst_notes)
    else:
        notes_section = "None provided."

    if recalled_memory:
        memory_section = "\n".join(f"- {item}" for item in recalled_memory)
    else:
        memory_section = "No prior memory available for this company (first time analyzing)."

    return f"""Target Company: {company_name}{ticker_str}

ANALYST NOTES (the analyst wants these tracked):
{notes_section}

RECALLED HISTORICAL MEMORY:
{memory_section}

CURRENT NEWS ARTICLES:
{articles_section}

Analyze the articles in relation to the recalled history and analyst notes.
CRITICAL: Explicitly address each analyst note in 'what_changed' and/or 'recurring_themes' (say what the new articles show about it, or explicitly state that there is no new info, and never invent facts).
Provide structured financial intelligence strictly conforming to the JSON schema.
"""
