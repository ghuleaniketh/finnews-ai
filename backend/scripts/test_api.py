import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Enforce isolated test database and test Memento DB
test_memento_db = backend_dir / "data" / "test_api_memento.db"
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "postgresql://postgres@localhost:5432/finnews_test")
os.environ["MEMENTO_DB_PATH"] = str(test_memento_db)

from fastapi.testclient import TestClient
import psycopg2
from app.db import init_db
from app.main import app

def cleanup():
    # Remove test SQLite DB
    for p in backend_dir.glob("data/test_api_memento.db*"):
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

def run_tests():
    cleanup()
    init_db()
    client = TestClient(app)

    try:
        # 1. Health check
        res = client.get('/api/health')
        assert res.status_code == 200, res.text
        assert res.json() == {'status': 'ok'}
        print('[PASS] Health check:', res.json())

        # 2. Create Watchlist item
        res = client.post('/api/watchlist', json={'name': 'HDFC Bank', 'ticker': 'HDFCBANK'})
        assert res.status_code == 201, res.text
        w_item = res.json()
        w_id = w_item['id']
        print('[PASS] Watchlist created:', w_item)

        # 3. Get Watchlist
        res = client.get('/api/watchlist')
        assert res.status_code == 200, res.text
        assert any(x['id'] == w_id for x in res.json())
        print('[PASS] Watchlist listed successfully')

        # 4. Post Note (Postgres + Memento)
        res = client.post('/api/notes', json={'watchlist_id': w_id, 'note': 'HDFC Bank merger synergies are materializing as expected.'})
        assert res.status_code == 201, res.text
        note_data = res.json()
        print('[PASS] Note created:', note_data)

        # 5. Get Notes
        res = client.get(f'/api/watchlist/{w_id}/notes')
        assert res.status_code == 200, res.text
        assert len(res.json()) >= 1
        print('[PASS] Notes retrieved successfully, count:', len(res.json()))

        # 6. Get Memory
        res = client.get(f'/api/watchlist/{w_id}/memory')
        assert res.status_code == 200, res.text
        mem = res.json()
        assert 'items' in mem
        print('[PASS] Memory retrieved successfully:', mem)

        # 7. Check 404 error formatting
        res = client.get('/api/analyses/999999')
        assert res.status_code == 404
        assert 'error' in res.json()
        print('[PASS] 404 error response matches contract:', res.json())

        # 8. Check 422 error formatting
        res = client.post('/api/watchlist', json={'ticker': 'TEST'})
        assert res.status_code == 422
        assert 'error' in res.json()
        print('[PASS] 422 validation error response matches contract:', res.json())

        # 9. Clean up: Delete Watchlist item
        res = client.delete(f'/api/watchlist/{w_id}')
        assert res.status_code == 200
        print('[PASS] Watchlist delete passed')
    finally:
        cleanup()

if __name__ == '__main__':
    run_tests()
