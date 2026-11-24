import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    func,
)
from sqlalchemy.orm import relationship
from app.db import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    ticker = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    articles = relationship("Article", back_populates="watchlist", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="watchlist", cascade="all, delete-orphan")
    notes = relationship("AnalystNote", back_populates="watchlist", cascade="all, delete-orphan")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlist.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    watchlist = relationship("Watchlist", back_populates="articles")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlist.id", ondelete="CASCADE"), nullable=False, index=True)
    headline = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    key_events = Column(JSON, nullable=False, default=list)
    entities = Column(JSON, nullable=False, default=list)
    sentiment = Column(String(50), nullable=False)  # positive | neutral | negative
    risk_level = Column(String(50), nullable=False)  # low | medium | high
    what_changed = Column(Text, nullable=False)
    recurring_themes = Column(JSON, nullable=False, default=list)
    sources = Column(JSON, nullable=False, default=list)
    memory_used = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    watchlist = relationship("Watchlist", back_populates="analyses")


class AnalystNote(Base):
    __tablename__ = "analyst_notes"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlist.id", ondelete="CASCADE"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    watchlist = relationship("Watchlist", back_populates="notes")
