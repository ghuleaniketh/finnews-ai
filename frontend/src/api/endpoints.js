import apiClient from './client';
import { mockApi } from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

console.info(
  `[FinNews AI] API Mode: ${USE_MOCK ? 'MOCK DATA (src/api/mock.js)' : 'LIVE BACKEND (' + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + ')'}`
);

/**
 * Health check
 * GET /health
 */
export async function getHealth() {
  if (USE_MOCK) return mockApi.getHealth();
  const res = await apiClient.get('/health');
  return res.data;
}

/**
 * Watchlist list
 * GET /watchlist
 */
export async function getWatchlist() {
  if (USE_MOCK) return mockApi.getWatchlist();
  const res = await apiClient.get('/watchlist');
  return res.data;
}

/**
 * Add company to watchlist
 * POST /watchlist {name, ticker?}
 */
export async function addWatchlistItem({ name, ticker }) {
  if (USE_MOCK) return mockApi.addWatchlistItem({ name, ticker });
  const payload = { name };
  if (ticker && ticker.trim()) {
    payload.ticker = ticker.trim();
  }
  const res = await apiClient.post('/watchlist', payload);
  return res.data;
}

/**
 * Delete company from watchlist
 * DELETE /watchlist/{id}
 */
export async function deleteWatchlistItem(id) {
  if (USE_MOCK) return mockApi.deleteWatchlistItem(id);
  const res = await apiClient.delete(`/watchlist/${id}`);
  return res.data;
}

/**
 * Trigger analysis run
 * POST /analyze {watchlist_id, max_articles?} -> Analysis
 * Timeout set to 180000ms (~3 min) to accommodate ~90s deep news scraping & memory synthesis
 */
export async function triggerAnalysis({ watchlist_id, max_articles = 10 }) {
  if (USE_MOCK) return mockApi.triggerAnalysis({ watchlist_id, max_articles });
  const res = await apiClient.post(
    '/analyze',
    {
      watchlist_id,
      max_articles,
    },
    {
      timeout: 180000, // 180s explicit timeout for analyze
    }
  );
  return res.data;
}

/**
 * Get analyses for a watchlist company (newest first)
 * GET /watchlist/{id}/analyses -> [Analysis]
 */
export async function getAnalyses(watchlistId) {
  if (USE_MOCK) return mockApi.getAnalyses(watchlistId);
  const res = await apiClient.get(`/watchlist/${watchlistId}/analyses`);
  return res.data;
}

/**
 * Get single analysis by id
 * GET /analyses/{id} -> Analysis
 */
export async function getAnalysis(id) {
  if (USE_MOCK) return mockApi.getAnalysis(id);
  const res = await apiClient.get(`/analyses/${id}`);
  return res.data;
}

/**
 * Get notes for a watchlist company
 * GET /watchlist/{id}/notes -> [Note]
 */
export async function getNotes(watchlistId) {
  if (USE_MOCK) return mockApi.getNotes(watchlistId);
  const res = await apiClient.get(`/watchlist/${watchlistId}/notes`);
  return res.data;
}

/**
 * Add note for a company
 * POST /notes {watchlist_id, note} -> Note
 */
export async function addNote({ watchlist_id, note }) {
  if (USE_MOCK) return mockApi.addNote({ watchlist_id, note });
  const res = await apiClient.post('/notes', {
    watchlist_id,
    note,
  });
  return res.data;
}

/**
 * Get memory for a watchlist company
 * GET /watchlist/{id}/memory -> {"items": [string]}
 */
export async function getMemory(watchlistId) {
  if (USE_MOCK) return mockApi.getMemory(watchlistId);
  const res = await apiClient.get(`/watchlist/${watchlistId}/memory`);
  return res.data;
}
