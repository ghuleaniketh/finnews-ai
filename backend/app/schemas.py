from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


# ── Analysis Sub-schemas ──────────────────────────────────────────

class KeyEvent(BaseModel):
    title: str = Field(description="Headline of the specific event")
    detail: str = Field(description="Detailed factual description of the event")
    source_url: str = Field(description="Direct URL where this event was reported")


class RecurringTheme(BaseModel):
    theme: str = Field(description="Name or title of recurring theme")
    note: str = Field(description="Context on how this relates to past history or trends")


class SourceItem(BaseModel):
    title: str = Field(description="Title of the article or source")
    url: str = Field(description="URL of the source")


# ── Gemini Structured Output Schema ──────────────────────────────

class GeminiAnalysisOutput(BaseModel):
    headline: str = Field(description="Catchy, informative overarching headline")
    summary: str = Field(description="Executive summary of current news developments")
    key_events: list[KeyEvent] = Field(description="List of discrete key financial/business events")
    entities: list[str] = Field(description="Key entities, competitors, or executives mentioned")
    sentiment: Literal["positive", "neutral", "negative"] = Field(description="Market sentiment")
    risk_level: Literal["low", "medium", "high"] = Field(description="Risk assessment level")
    what_changed: str = Field(description="Explicit differences compared to previous memory/notes")
    recurring_themes: list[RecurringTheme] = Field(description="Themes persisting across time")


# ── API Contract Schemas (Do Not Rename Fields) ──────────────────

class AnalysisResponse(BaseModel):
    id: int
    watchlist_id: int
    headline: str
    summary: str
    key_events: list[KeyEvent]
    entities: list[str]
    sentiment: str  # positive | neutral | negative
    risk_level: str  # low | medium | high
    what_changed: str
    recurring_themes: list[RecurringTheme]
    sources: list[SourceItem]
    memory_used: list[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Watchlist Schemas ─────────────────────────────────────────────

class WatchlistCreate(BaseModel):
    name: str = Field(..., description="Company name, e.g. 'HDFC Bank'")
    ticker: str | None = Field(None, description="Stock ticker, e.g. 'HDFCBANK.NS' or 'HDB'")


class WatchlistResponse(BaseModel):
    id: int
    name: str
    ticker: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analyze Request ───────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    watchlist_id: int
    max_articles: int | None = Field(default=3, description="Maximum number of articles to scrape and analyze (default: 3)")


# ── Notes Schemas ─────────────────────────────────────────────────

class NoteCreate(BaseModel):
    watchlist_id: int
    note: str


class NoteResponse(BaseModel):
    id: int
    watchlist_id: int
    note: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Memory Response ───────────────────────────────────────────────

class MemoryResponse(BaseModel):
    items: list[str]


# ── Error Response ────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
