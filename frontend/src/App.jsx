import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CompanyDetail from './pages/CompanyDetail';
import ErrorBanner from './components/ErrorBanner';
import Loader from './components/Loader';
import { getWatchlist, addWatchlistItem, deleteWatchlistItem } from './api/endpoints';

export default function App() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load watchlist on mount
  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getWatchlist();
      setWatchlist(items);
    } catch (err) {
      setError(err.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Add company to watchlist
  const handleAddCompany = async ({ name, ticker }) => {
    const newItem = await addWatchlistItem({ name, ticker });
    setWatchlist((prev) => [...prev, newItem]);
    return newItem;
  };

  // Delete company from watchlist
  const handleDeleteCompany = async (id) => {
    await deleteWatchlistItem(id);
    setWatchlist((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader message="Initializing FinNews AI Engine..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout
        watchlist={watchlist}
        onDeleteCompany={handleDeleteCompany}
        onAddCompany={handleAddCompany}
      >
        <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchWatchlist} />
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                watchlist={watchlist}
                onAddCompany={handleAddCompany}
              />
            }
          />
          <Route
            path="/company/:id"
            element={<CompanyDetail watchlist={watchlist} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
