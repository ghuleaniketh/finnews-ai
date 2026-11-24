import os
import sys
from pathlib import Path
from unittest.mock import patch

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Enforce isolated test database and test Memento DB
test_memento_db = backend_dir / "data" / "test_pipeline_memento.db"
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "postgresql://postgres@localhost:5432/finnews_test")
os.environ["MEMENTO_DB_PATH"] = str(test_memento_db)

from fastapi.testclient import TestClient
import psycopg2
from app.db import init_db
from app.main import app
from app.schemas import GeminiAnalysisOutput, KeyEvent, RecurringTheme

def cleanup():
    # Remove test SQLite DB
    for p in backend_dir.glob("data/test_pipeline_memento.db*"):
        try:
            p.unlink()
        except OSError:
            pass
    # Truncate test Postgres database
    try:
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("TRUNCATE watchlist, articles, analyses, analyst_notes RESTART IDENTITY CASCADE;")
        conn.close()
    except Exception as e:
        print("Note: Postgres test DB cleanup:", e)

def run_pipeline_test():
    cleanup()
    init_db()
    client = TestClient(app)

    try:
        # 1. Create a Watchlist company
        res = client.post("/api/watchlist", json={"name": "Tata Motors", "ticker": "TATAMOTORS"})
        assert res.status_code == 201
        w_id = res.json()["id"]
        print(f"[PASS] Created company with id {w_id}")

        # 2. Add an analyst note
        res = client.post("/api/notes", json={"watchlist_id": w_id, "note": "EV margins expected to improve in Q4."})
        assert res.status_code == 201
        print("[PASS] Added analyst note")

        # 3. Mock Firecrawl and Gemini to test full pipeline flow
        mock_articles = [
            {
                "url": "https://finance.example.com/tatamotors-q3",
                "title": "Tata Motors Reports Strong Q3 Profit Growth",
                "content": "Tata Motors delivered a record performance in Q3 driven by JLR volumes and EV adoption in India."
            }
        ]

        mock_llm_output = GeminiAnalysisOutput(
            headline="Tata Motors Accelerates EV and Luxury Margins",
            summary="Tata Motors demonstrated robust operational performance across JLR and commercial segments.",
            key_events=[
                KeyEvent(
                    title="Q3 Profit Surge",
                    detail="Net profit surged driven by higher Jaguar Land Rover margins.",
                    source_url="https://finance.example.com/tatamotors-q3"
                )
            ],
            entities=["Tata Motors", "Jaguar Land Rover"],
            sentiment="positive",
            risk_level="low",
            what_changed="Margins in EV division expanded faster than projected in prior analyst notes.",
            recurring_themes=[
                RecurringTheme(
                    theme="EV Profitability",
                    note="Continuation of positive unit economics observed in past quarters."
                )
            ]
        )

        with patch("app.services.pipeline.firecrawl_service.scrape_company_news", return_value=mock_articles), \
             patch("app.services.pipeline.llm_service.analyze_news", return_value=mock_llm_output):
            
            # Trigger analyze endpoint
            res = client.post("/api/analyze", json={"watchlist_id": w_id, "max_articles": 3})
            assert res.status_code == 200, res.text
            analysis = res.json()
            print("[PASS] Pipeline POST /api/analyze executed successfully!")
            print("Analysis keys:", list(analysis.keys()))
            
            # Verify exact Analysis JSON shape
            expected_fields = [
                "id", "watchlist_id", "headline", "summary", "key_events",
                "entities", "sentiment", "risk_level", "what_changed",
                "recurring_themes", "sources", "memory_used", "created_at"
            ]
            for field in expected_fields:
                assert field in analysis, f"Missing field {field} in Analysis response"
            assert analysis["watchlist_id"] == w_id
            assert analysis["sentiment"] == "positive"
            assert analysis["risk_level"] == "low"
            assert len(analysis["key_events"]) == 1
            assert len(analysis["sources"]) == 1
            assert analysis["sources"][0]["url"] == "https://finance.example.com/tatamotors-q3"
            print("[PASS] Analysis JSON shape matches exact contract specification!")

            # 4. Test GET /api/watchlist/{id}/analyses
            res = client.get(f"/api/watchlist/{w_id}/analyses")
            assert res.status_code == 200
            analyses_list = res.json()
            assert len(analyses_list) >= 1
            assert analyses_list[0]["id"] == analysis["id"]
            print(f"[PASS] GET /api/watchlist/{w_id}/analyses returned {len(analyses_list)} records, newest first.")

            # 5. Test GET /api/analyses/{id}
            a_id = analysis["id"]
            res = client.get(f"/api/analyses/{a_id}")
            assert res.status_code == 200
            single_analysis = res.json()
            assert single_analysis["id"] == a_id
            print(f"[PASS] GET /api/analyses/{a_id} retrieved successfully.")

        # Clean up
        client.delete(f"/api/watchlist/{w_id}")
        print("[PASS] Cleaned up test data.")
    finally:
        cleanup()

if __name__ == "__main__":
    run_pipeline_test()
