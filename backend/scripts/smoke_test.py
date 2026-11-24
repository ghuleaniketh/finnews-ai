#!/usr/bin/env python3
"""Smoke test script for FinNews AI backend integrations.

Tests:
1. SQLite application database connection
2. Real Gemini embedding call using 'gemini-embedding-001' (vector length 384, L2 normalized)
3. Gemini structured JSON call using GEMINI_MODEL
4. Memento ingest & recall using gemini-embedding-001 and GEMINI_MODEL (verifies entities_created is non-empty)
5. Firecrawl search + scrape with domain filtering and content quality check
"""

import os
import sys
import json
import logging
from pathlib import Path
import numpy as np
from pydantic import BaseModel

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smoke_test")


def test_sqlite() -> bool:
    """Test 1: SQLite application database connection and foreign-key enforcement."""
    logger.info("--- Testing (1/5) SQLite Connection ---")
    try:
        os.makedirs(settings.BASE_DIR / "data", exist_ok=True)
        from sqlalchemy import text
        from app.db import engine

        if engine.dialect.name != "sqlite":
            raise AssertionError(f"Expected SQLite app database, got {engine.dialect.name}")
        with engine.connect() as conn:
            assert conn.execute(text("SELECT 1")).scalar() == 1
            assert conn.execute(text("PRAGMA foreign_keys")).scalar() == 1
        logger.info(f"✓ SQLite OK: database='{settings.DATABASE_URL}' with foreign keys enabled")
        return True
    except Exception as e:
        logger.error(f"✗ SQLite Failed: {e}")
        raise


def test_real_embedding() -> np.ndarray:
    """Test 2: Make a real embedding call using gemini-embedding-001 (dimension=384, L2 normalized)."""
    logger.info("--- Testing (2/5) Real Gemini Embedding Call (gemini-embedding-001) ---")
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set in .env.")

    from app.services.memory_service import GeminiEmbedder

    embedder = GeminiEmbedder(model="gemini-embedding-001", dimension=384)
    sample_text = "HDFC Bank reported net profit growth of 33% YoY."
    vec = embedder.embed(sample_text)

    l2_norm = float(np.linalg.norm(vec))

    print(f"\n[EMBEDDING RESULT]")
    print(f"Model          : gemini-embedding-001")
    print(f"Vector length  : {len(vec)} (expected: 384)")
    print(f"L2 Norm        : {l2_norm:.6f} (expected: 1.000000)")
    print(f"Vector preview : {vec[:5].tolist()}...\n")

    if len(vec) != 384:
        raise AssertionError(f"Expected vector length 384, got {len(vec)}")
    if abs(l2_norm - 1.0) > 1e-4:
        raise AssertionError(f"Vector is not L2-normalized: norm={l2_norm}")

    logger.info("✓ Real Gemini Embedding OK: 384-dimensional vector successfully generated and L2-normalized.")
    return vec


def test_gemini() -> bool:
    """Test 3: Gemini API call returning valid JSON schema using GEMINI_MODEL."""
    logger.info(f"--- Testing (3/5) Gemini JSON Call (model: {settings.GEMINI_MODEL}) ---")
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set in .env.")

    from google import genai
    from google.genai import types

    class SmokeTestSchema(BaseModel):
        company: str
        summary: str
        confidence_score: float

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    cfg_kwargs = {
        "response_mime_type": "application/json",
        "response_schema": SmokeTestSchema,
        "temperature": 0.1,
        "max_output_tokens": 2048,
    }
    if "lite" not in settings.GEMINI_MODEL.lower():
        cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)

    import time
    last_err = None
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents="Provide a quick 1-sentence financial note about HDFC Bank.",
                config=types.GenerateContentConfig(**cfg_kwargs),
            )
            parsed = json.loads(response.text)
            print(f"\n[GEMINI JSON RESULT]\n{json.dumps(parsed, indent=2)}\n")
            logger.info(f"✓ Gemini OK: model={settings.GEMINI_MODEL}, received valid JSON.")
            return True
        except Exception as e:
            last_err = e
            logger.warning(f"Gemini attempt {attempt + 1}/3 encountered: {e}. Retrying...")
            time.sleep(1.5)

    logger.error(f"Gemini API call failed for model '{settings.GEMINI_MODEL}' after 3 attempts: {last_err}")
    raise last_err


def test_memento() -> bool:
    """Test 4: Memento memory ingest & recall (verifies entities_created is non-empty)."""
    logger.info(f"--- Testing (4/5) Memento Ingest & Recall (model: {settings.GEMINI_MODEL}) ---")
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set in .env.")

    test_db_path = settings.BASE_DIR / "data" / "smoke_test_memento.db"
    if test_db_path.exists():
        test_db_path.unlink()

    # Crucial: MementoConfig.__post_init__ reads MEMENTO_DB_PATH from environment
    os.environ["MEMENTO_DB_PATH"] = str(test_db_path)
    os.environ["MEMENTO_EXTRACTION_MODEL"] = settings.GEMINI_MODEL
    os.environ["MEMENTO_TIEBREAKER_MODEL"] = settings.GEMINI_MODEL

    import app.services.memory_service
    from memento.config import MementoConfig, EmbeddingConfig, LLMConfig
    from memento import MemoryStore

    cfg = MementoConfig(
        db_path=test_db_path,
        embedding=EmbeddingConfig(provider="gemini", dimension=384),
        llm=LLMConfig(
            provider="gemini",
            api_key=settings.GOOGLE_API_KEY,
            extraction_model=settings.GEMINI_MODEL,
            tiebreaker_model=settings.GEMINI_MODEL,
        ),
    )

    with MemoryStore(cfg) as store:
        fact = "HDFC Bank reported net profit of Rs 16,372 crore for Q3 with net interest income rising 4%."
        logger.info(f"Ingesting fact into Memento: '{fact}'")
        result = store.ingest(fact, source_type="news", authority=0.95)

        print(f"\n[MEMENTO INGEST RESULT]")
        print(f"Entities created     : {result.entities_created}")
        print(f"Relationships created: {result.relationships_created}")

        # Assert entities_created is non-empty
        if not result.entities_created:
            raise AssertionError(f"Expected entities_created to be non-empty, but got: {result.entities_created}")

        query = "HDFC Bank net profit"
        logger.info(f"Recalling memory for query: '{query}'...")
        ctx = store.recall(query)

        recalled_text = ctx.text or ""
        print("\n" + "="*60)
        print("MEMENTO RECALL RESULT")
        print(f"{recalled_text.strip()}")
        print("="*60 + "\n")

        # Verify ingested fact is returned in recall
        fact_found = "16,372" in recalled_text or any("16,372" in getattr(f, "value", "") for f in ctx.facts)
        if not fact_found:
            raise RuntimeError(f"Ingested fact was not returned in recall! Recalled text: {recalled_text}")

        logger.info(f"✓ Memento OK: Extracted entities {result.entities_created} and recalled fact.")

    if test_db_path.exists():
        test_db_path.unlink()
    return True


def test_firecrawl() -> bool:
    """Test 5: Firecrawl search and scrape for 'HDFC Bank' with quality filtering."""
    logger.info("--- Testing (5/5) Firecrawl Search & Scrape (Quality Filtering) ---")
    if not settings.FIRECRAWL_API_KEY:
        raise ValueError("FIRECRAWL_API_KEY is not set in .env.")

    from app.services.firecrawl_service import firecrawl_service

    logger.info("Searching and scraping 1 high-quality article for 'HDFC Bank'...")
    articles = firecrawl_service.scrape_company_news("HDFC Bank", max_articles=1)

    if not articles:
        raise RuntimeError("Firecrawl failed to collect any quality articles passing domain & length filters.")

    art = articles[0]
    print(f"\n[FIRECRAWL ARTICLE RESULT]")
    print(f"Title         : {art['title']}")
    print(f"URL           : {art['url']}")
    print(f"Content Length: {len(art['content'])} characters (threshold >= 800)")
    print(f"Snippet       : {art['content'][:250]}...\n")

    if len(art["content"]) < 800:
        raise AssertionError(f"Scraped content too short: {len(art['content'])} chars")

    logger.info(f"✓ Firecrawl OK: Scraped quality article ({len(art['content'])} chars) from {art['url']}")
    return True


def main():
    logger.info("Starting FinNews AI Smoke Test...")

    sqlite_ok = False
    sqlite_err = None
    try:
        sqlite_ok = test_sqlite()
    except Exception as e:
        sqlite_err = str(e)

    embed_ok = False
    embed_err = None
    try:
        test_real_embedding()
        embed_ok = True
    except Exception as e:
        embed_err = str(e)

    gemini_ok = False
    gemini_err = None
    try:
        gemini_ok = test_gemini()
    except Exception as e:
        gemini_err = str(e)

    memento_ok = False
    memento_err = None
    try:
        memento_ok = test_memento()
    except Exception as e:
        memento_err = str(e)

    firecrawl_ok = False
    firecrawl_err = None
    try:
        firecrawl_ok = test_firecrawl()
    except Exception as e:
        firecrawl_err = str(e)

    print("\n" + "="*60)
    print("SMOKE TEST SUMMARY")
    print(f"SQLite Application DB    : {'PASS' if sqlite_ok else f'FAIL: {sqlite_err}'}")
    print(f"Embedding (gemini-001)   : {'PASS' if embed_ok else f'FAIL: {embed_err}'}")
    print(f"Gemini LLM JSON          : {'PASS' if gemini_ok else f'FAIL: {gemini_err}'}")
    print(f"Memento Ingest & Recall  : {'PASS' if memento_ok else f'FAIL: {memento_err}'}")
    print(f"Firecrawl Search+Scrape  : {'PASS' if firecrawl_ok else f'FAIL: {firecrawl_err}'}")
    print("="*60 + "\n")

    if not (sqlite_ok and embed_ok and gemini_ok and memento_ok and firecrawl_ok):
        sys.exit(1)


if __name__ == "__main__":
    main()
