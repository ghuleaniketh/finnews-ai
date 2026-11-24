import os
import sys
import json
import time
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Use production settings (real Postgres + real Memento)
os.environ["DATABASE_URL"] = "postgresql://postgres@localhost:5432/finnews"
os.environ["MEMENTO_DB_PATH"] = str(backend_dir / "data" / "memento.db")

from fastapi.testclient import TestClient
from app.main import app
from app.services.pipeline import pipeline_service

def main():
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
    res1 = client.post("/api/analyze", json={"watchlist_id": w_id, "max_articles": 3})
    dur1 = time.perf_counter() - t0
    assert res1.status_code == 200, f"First analyze failed: {res1.text}"
    analysis1 = res1.json()

    print(f"\n--- RUN 1 RESULTS (Total Duration: {dur1:.2f}s) ---")
    print(f"Headline     : {analysis1.headline if hasattr(analysis1, 'headline') else analysis1.get('headline')}")
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

    # Small pause between runs to let Firecrawl rate limit window breathe
    print("\nWaiting 6 seconds before Run 2 for rate limits and Memento indexing...")
    time.sleep(6)

    print("\n========================================================")
    print("STEP 3: SECOND POST /api/analyze (Contextual Run)")
    print("========================================================")
    t1 = time.perf_counter()
    res2 = client.post("/api/analyze", json={"watchlist_id": w_id, "max_articles": 3})
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

    print("\n========================================================")
    print("COMPARATIVE SUMMARY")
    print("========================================================")
    print(f"Run 1 Total Time : {dur1:.2f} s (Target: < 60s)")
    print(f"Run 2 Total Time : {dur2:.2f} s (Target: < 60s)")
    print(f"Run 1 Memory Items: {len(analysis1.get('memory_used', []))}")
    print(f"Run 2 Memory Items: {len(analysis2.get('memory_used', []))}")
    print("========================================================\n")

if __name__ == "__main__":
    main()
