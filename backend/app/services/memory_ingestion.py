"""Serialize Memento work for each watchlist company.

Memento's SQLite-backed graph must finish an earlier ingest before a later
recall for the same company can observe it.  This coordinator keeps slow
ingestion off the request path while preserving that ordering.
"""

import logging
import threading
from collections import defaultdict
from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor
from typing import TypeVar

logger = logging.getLogger("memory_ingestion")

T = TypeVar("T")


class CompanyMemoryCoordinator:
    def __init__(self) -> None:
        self._state = threading.Condition()
        self._company_locks: dict[int, threading.Lock] = {}
        self._pending_ingests: dict[int, int] = defaultdict(int)
        self._executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="memento-ingest")

    def _lock_for(self, watchlist_id: int) -> threading.Lock:
        with self._state:
            return self._company_locks.setdefault(watchlist_id, threading.Lock())

    def run_after_pending_ingest(self, watchlist_id: int, operation: Callable[[], T]) -> T:
        """Run a recall or synchronous note ingest after earlier ingestion finishes."""
        lock = self._lock_for(watchlist_id)
        with self._state:
            while self._pending_ingests[watchlist_id]:
                logger.info("Waiting for pending Memento ingest (watchlist_id=%s).", watchlist_id)
                self._state.wait()
            # Taking the company lock while state is held establishes the boundary:
            # an ingest scheduled afterwards is newer than this memory operation.
            lock.acquire()
        try:
            return operation()
        finally:
            lock.release()

    def schedule_ingest(self, watchlist_id: int, operation: Callable[[], object]) -> Future:
        """Queue ingestion and return immediately, while making it visible to later recalls."""
        lock = self._lock_for(watchlist_id)
        with self._state:
            self._pending_ingests[watchlist_id] += 1

        def ingest() -> object:
            try:
                with lock:
                    return operation()
            except Exception:
                logger.exception("Background Memento ingest failed (watchlist_id=%s).", watchlist_id)
                return None
            finally:
                with self._state:
                    self._pending_ingests[watchlist_id] -= 1
                    self._state.notify_all()

        return self._executor.submit(ingest)


company_memory_coordinator = CompanyMemoryCoordinator()
