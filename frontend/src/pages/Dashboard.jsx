import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Building2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import SentimentBadge from '../components/SentimentBadge';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import { getAnalyses } from '../api/endpoints';

/**
 * Dashboard: Overview of financial intelligence across all tracked watchlist entities.
 * Shows latest synthesis per company, overall stats, and empty states.
 */
export default function Dashboard({ watchlist = [], onAddCompany }) {
  const [latestAnalyses, setLatestAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadLatestAnalyses() {
      if (!watchlist || watchlist.length === 0) {
        setLatestAnalyses({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          watchlist.map(async (company) => {
            try {
              const analyses = await getAnalyses(company.id);
              return { companyId: company.id, latest: analyses[0] || null };
            } catch (err) {
              console.warn(`Could not fetch analysis for ${company.name}:`, err);
              return { companyId: company.id, latest: null };
            }
          })
        );

        if (isMounted) {
          const map = {};
          results.forEach(({ companyId, latest }) => {
            if (latest) map[companyId] = latest;
          });
          setLatestAnalyses(map);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load company analyses');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLatestAnalyses();

    return () => {
      isMounted = false;
    };
  }, [watchlist]);

  // Aggregate high-level stats
  const totalTracked = watchlist.length;
  const analyzedCount = Object.keys(latestAnalyses).length;
  const bullishCount = Object.values(latestAnalyses).filter(
    (a) => a.sentiment === 'positive'
  ).length;
  const bearishCount = Object.values(latestAnalyses).filter(
    (a) => a.sentiment === 'negative'
  ).length;

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Hero Welcome Banner */}
      <div className="dashboard-hero">
        <h1 className="dashboard-hero-title">Financial News Intelligence</h1>
        <p className="dashboard-hero-subtitle">
          Real-time synthesis powered by evolving institutional memory. Scrapes financial news,
          correlates market events with historical analyst notes, and highlights changes since your
          last run.
        </p>

        <div className="dashboard-stats-row">
          <div className="stat-chip">
            <Building2 size={16} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div className="stat-chip-number">{totalTracked}</div>
              <div className="stat-chip-label">Watchlist Entities</div>
            </div>
          </div>

          <div className="stat-chip">
            <Brain size={16} style={{ color: '#c084fc' }} />
            <div>
              <div className="stat-chip-number">{analyzedCount}</div>
              <div className="stat-chip-label">Active Profiles</div>
            </div>
          </div>

          <div className="stat-chip">
            <TrendingUp size={16} style={{ color: '#34d399' }} />
            <div>
              <div className="stat-chip-number">{bullishCount}</div>
              <div className="stat-chip-label">Bullish Posture</div>
            </div>
          </div>

          <div className="stat-chip">
            <ShieldAlert size={16} style={{ color: '#fb7185' }} />
            <div>
              <div className="stat-chip-number">{bearishCount}</div>
              <div className="stat-chip-label">Bearish / Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Latest Intelligence Reports
        </h2>
      </div>

      {loading ? (
        <Loader message="Aggregating latest intelligence across watchlist..." />
      ) : watchlist.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Building2 size={28} />
          </div>
          <h3 className="empty-state-title">Your Watchlist is Empty</h3>
          <p className="empty-state-desc">
            Add a company or topic using the sidebar form to begin scraping news and tracking evolving market memory.
          </p>
        </div>
      ) : (
        <div className="company-cards-grid">
          {watchlist.map((company) => {
            const analysis = latestAnalyses[company.id];

            return (
              <div
                key={company.id}
                className="glass-card company-overview-card glass-card-interactive"
                onClick={() => navigate(`/company/${company.id}`)}
              >
                <div>
                  <div className="card-top-row">
                    <div>
                      <div className="company-card-name">{company.name}</div>
                      {company.ticker && (
                        <span className="company-ticker-badge" style={{ marginTop: '4px', display: 'inline-block' }}>
                          {company.ticker}
                        </span>
                      )}
                    </div>
                    {analysis && <SentimentBadge sentiment={analysis.sentiment} />}
                  </div>

                  {analysis ? (
                    <>
                      <h4 className="company-card-headline">{analysis.headline}</h4>
                      <p className="company-card-summary">{analysis.summary}</p>

                      {analysis.what_changed && (
                        <div className="company-card-what-changed">
                          <div className="company-card-what-changed-label">
                            <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            Memory Shift
                          </div>
                          <p className="company-card-what-changed-text">
                            {analysis.what_changed}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                      No synthesis run yet for this entity. Click to view and trigger first automated run.
                    </div>
                  )}
                </div>

                <div className="card-footer-row">
                  <span className="card-date-stamp">
                    {analysis ? (
                      <>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {new Date(analysis.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </>
                    ) : (
                      'Pending first run'
                    )}
                  </span>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View Report <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
