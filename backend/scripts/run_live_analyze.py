import os
import sys
import json
import time
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Use the default local SQLite app database and the real Memento store.
os.environ["DATABASE_URL"] = f"sqlite:///{backend_dir / 'data' / 'finnews.db'}"
os.environ["MEMENTO_DB_PATH"] = str(backend_dir / "data" / "memento.db")

from fastapi.testclient import TestClient
from app.db import init_db
from app.main import app
from app.services.pipeline import pipeline_service

def main():
    init_db()
    client = TestClient(app)

    print("\n========================================================")
    print("STEP 1: POST /api/watchlist for 'HDFC Bank'")
    print("========================================================")
    res = client.post("/api/watchlist", json={"name": "HDFC Bank", "ticker": "HDFCBANK"})
    assert res.status_code == 201, f"Failed to create watchlist: {res.text}"
    company = res.json()
    w_id = company["id"]
    print(f"Created Watchlist item: ID={w_id}, Name='{company['name']}', Ticker='{company['ticker']}'")

    print("\n========================================================")
    print("STEP 2: FIRST POST /api/analyze (Baseline Run)")
    print("========================================================")
    t0 = time.perf_counter()
    res1 = client.post("/api/analyze", json={"watchlist_id": w_id, "max_articles": 1})
    dur1 = time.perf_counter() - t0
    assert res1.status_code == 200, f"First analyze failed: {res1.text}"
    analysis1 = res1.json()

    print(f"\n--- RUN 1 RESULTS (Total Duration: {dur1:.2f}s) ---")
    print(f"Headline     : {analysis1.get('headline')}")
    print(f"Sentiment    : {analysis1.get('sentiment')}, Risk Level: {analysis1.get('risk_level')}")
    print(f"Sources used : {len(analysis1.get('sources', []))} articles")
    for s in analysis1.get("sources", []):
        print(f"  - {s.get('title')}: {s.get('url')}")
    print(f"\nMemory Used (Run 1):")
    if analysis1.get("memory_used"):
        for m in analysis1["memory_used"]:
            print(f"  * {m}")
    else:
        print("  (Empty - initial baseline run)")
    print(f"\nWhat Changed (Run 1):\n{analysis1.get('what_changed')}")

    # Verify Analysis 1 shape
    analysis_fields = [
        "id", "watchlist_id", "headline", "summary", "key_events",
        "entities", "sentiment", "risk_level", "what_changed",
        "recurring_themes", "sources", "memory_used", "created_at"
    ]
    for field in analysis_fields:
        assert field in analysis1, f"Missing field '{field}' in Run 1 analysis response"
    print("\n[VERIFIED] Run 1 response shape contains all 13 expected fields.")

    print("\n========================================================")
    print("STEP 3: POST /api/notes (Adding Analyst Note Between Runs)")
    print("========================================================")
    note_payload = {
        "watchlist_id": w_id,
        "note": "Watch deposit pricing probe outcome and CEO succession."
    }
    res_note = client.post("/api/notes", json=note_payload)
    assert res_note.status_code == 201, f"Failed to create note: {res_note.text}"
    note_data = res_note.json()
    print("Created Note:", note_data)

    note_fields = ["id", "watchlist_id", "note", "created_at"]
    for field in note_fields:
        assert field in note_data, f"Missing field '{field}' in Note response"
    print("[VERIFIED] Note response shape contains all 4 expected fields.")

    # Small pause between runs to let Firecrawl rate limit window breathe and Memento indexing start
    print("\nWaiting 6 seconds before Run 2 for rate limits and Memento indexing...")
    time.sleep(6)

    print("\n========================================================")
    print("STEP 4: SECOND POST /api/analyze (Contextual Run with Note)")
    print("========================================================")
    t1 = time.perf_counter()
    res2 = client.post("/api/analyze", json={"watchlist_id": w_id, "max_articles": 1})
    dur2 = time.perf_counter() - t1
    assert res2.status_code == 200, f"Second analyze failed: {res2.text}"
    analysis2 = res2.json()

    print(f"\n--- RUN 2 RESULTS (Total Duration: {dur2:.2f}s) ---")
    print(f"Headline     : {analysis2.get('headline')}")
    print(f"Sentiment    : {analysis2.get('sentiment')}, Risk Level: {analysis2.get('risk_level')}")
    print(f"Sources used : {len(analysis2.get('sources', []))} articles")
    for s in analysis2.get("sources", []):
        print(f"  - {s.get('title')}: {s.get('url')}")
    print(f"\nMemory Used (Run 2) [Scoped to HDFC Bank]:")
    if analysis2.get("memory_used"):
        for m in analysis2["memory_used"]:
            print(f"  * {m}")
    else:
        print("  (Warning: memory_used was empty in run 2)")
    print(f"\nWhat Changed (Run 2):\n{analysis2.get('what_changed')}")
    print("\nRecurring Themes (Run 2):")
    for theme in analysis2.get("recurring_themes", []):
        print(f"  * {theme.get('theme')}: {theme.get('note')}")

    for field in analysis_fields:
        assert field in analysis2, f"Missing field '{field}' in Run 2 analysis response"
    print("\n[VERIFIED] Run 2 response shape contains all 13 expected fields.")

    # Verify that the analyst note appears in memory_used
    assert any("Watch deposit pricing probe outcome and CEO succession." in m for m in analysis2.get("memory_used", [])), \
        "Expected analyst note to appear in Run 2 memory_used!"
    print("\n[VERIFIED] Analyst note visibly appears in Run 2 memory_used!")

    print("\n========================================================")
    print("COMPARATIVE SUMMARY & RESPONSE SHAPE VERIFICATION")
    print("========================================================")
    print(f"Run 1 Total Time : {dur1:.2f} s (Target: < 60s)")
    print(f"Run 2 Total Time : {dur2:.2f} s (Target: < 60s)")
    print(f"Run 1 Memory Items: {len(analysis1.get('memory_used', []))}")
    print(f"Run 2 Memory Items: {len(analysis2.get('memory_used', []))}")
    print("All API response shapes strictly match specification: PASS")
    print("========================================================\n")

if __name__ == "__main__":
    main()
