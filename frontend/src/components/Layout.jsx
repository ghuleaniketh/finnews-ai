import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Zap, Activity } from 'lucide-react';
import WatchlistSidebar from './WatchlistSidebar';
import { getHealth } from '../api/endpoints';

/**
 * Layout: top application shell with responsive header and drawer
 */
export default function Layout({
  children,
  watchlist = [],
  selectedId,
  onDeleteCompany,
  onAddCompany,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState('checking');
  const location = useLocation();

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    let mounted = true;
    async function checkBackend() {
      try {
        const res = await getHealth();
        if (mounted && (res?.status === 'ok' || res?.mock)) {
          setHealthStatus('connected');
        } else if (mounted) {
          setHealthStatus('online');
        }
      } catch (err) {
        if (mounted) {
          setHealthStatus('disconnected');
        }
      }
    }
    checkBackend();
    return () => {
      mounted = false;
    };
  }, []);

  // Close sidebar on mobile route transition
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      <WatchlistSidebar
        watchlist={watchlist}
        selectedId={selectedId}
        onDeleteCompany={onDeleteCompany}
        onAddCompany={onAddCompany}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main-wrapper">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="nav-brand">
              <div className="nav-brand-logo">
                <Zap size={18} />
              </div>
              <div className="nav-brand-text">
                FinNews <span>AI</span>
              </div>
            </Link>
          </div>

          <div className="nav-meta-cluster">
            {isMock ? (
              <span className="pill-badge pill-badge-mock" title="Operating with mock financial intelligence">
                <Activity size={12} />
                Mock Mode
              </span>
            ) : (
              <span className="pill-badge pill-badge-live" title="Connected to live financial intelligence server">
                <span className="health-dot" />
                Live API
              </span>
            )}
            <span
              style={{
                fontSize: '0.74rem',
                color: healthStatus === 'connected' || healthStatus === 'online' ? '#34d399' : '#f43f5e',
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: healthStatus === 'connected' || healthStatus === 'online' ? '#10b981' : '#f43f5e',
                }}
              />
              {healthStatus}
            </span>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
