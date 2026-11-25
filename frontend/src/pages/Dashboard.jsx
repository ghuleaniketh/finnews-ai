import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import SentimentBadge from '../components/SentimentBadge';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import { getAnalyses } from '../api/endpoints';
import { useAddCompany } from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Dashboard: Overview of financial intelligence across all tracked watchlist entities.
 * Warm cream minimal formal design with executive stat counters, company report cards, and empty state.
 */
export default function Dashboard({ watchlist = [], onAddCompany }) {
  const [latestAnalyses, setLatestAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { openAddDialog } = useAddCompany();

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Page Title & Intro */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Financial News Intelligence
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Continuous intelligence synthesis correlated with institutional memory. Tracks news flow,
          highlights market narrative shifts, and analyzes sentiment trajectories.
        </p>
      </div>

      {/* Executive Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-muted border border-border flex items-center justify-center text-foreground shrink-0">
              <Icon name="apartment" size={18} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-foreground">{totalTracked}</div>
              <div className="text-xs text-muted-foreground font-medium">Watchlist Entities</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-accent border border-border flex items-center justify-center text-foreground shrink-0">
              <Icon name="psychology" size={18} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-foreground">{analyzedCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Active Profiles</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-[#E4EFDF] border border-[#C9DEC2] flex items-center justify-center text-[#3F6B35] shrink-0">
              <Icon name="trending_up" size={18} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#3F6B35]">{bullishCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Bullish Posture</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-[#F5E0DB] border border-[#E8C6BE] flex items-center justify-center text-[#9B3B2E] shrink-0">
              <Icon name="shield" size={18} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#9B3B2E]">{bearishCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Bearish / Risk</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Section Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Latest Intelligence Reports
        </h2>
        {watchlist.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {watchlist.length} {watchlist.length === 1 ? 'entity' : 'entities'} tracked
          </span>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 bg-card rounded-lg border border-border">
          <Loader message="Aggregating intelligence reports across watchlist..." />
        </div>
      ) : watchlist.length === 0 ? (
        /* Empty Dashboard State: Centered Card with a clear 'Add your first company' button opening Dialog */
        <Card className="max-w-md mx-auto text-center p-8 bg-card border border-border shadow-xs">
          <CardHeader className="p-0 pb-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-accent border border-border flex items-center justify-center text-foreground mb-3">
              <Icon name="apartment" size={24} />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              No companies tracked yet
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mt-1">
              Add your first company or industry topic to begin monitoring financial news, sentiment trends, and evolving institutional memory.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Button
              onClick={openAddDialog}
              className="w-full sm:w-auto min-h-[40px] px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs"
            >
              <Icon name="add" size={16} className="mr-2" />
              Add your first company
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Grid of Company Reports */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchlist.map((company) => {
            const analysis = latestAnalyses[company.id];

            return (
              <Card
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className="bg-card border border-border hover:border-[#B89B6A] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {company.name}
                      </CardTitle>
                      {company.ticker && (
                        <span className="inline-block mt-1 text-[11px] font-mono uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                          {company.ticker}
                        </span>
                      )}
                    </div>
                    {analysis && <SentimentBadge sentiment={analysis.sentiment} />}
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 flex-1">
                  {analysis ? (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-1">
                        {analysis.headline}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {analysis.summary}
                      </p>

                      {analysis.what_changed && (
                        <div className="border-l-2 border-[#B89B6A] bg-muted pl-2.5 py-1.5 pr-2 rounded-r text-xs mt-2">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground uppercase tracking-wider mb-0.5">
                            <Icon name="auto_awesome" size={12} className="text-[#3B2F24]" />
                            <span>Memory Shift</span>
                          </div>
                          <p className="text-foreground/90 line-clamp-2 text-[11px] leading-snug">
                            {analysis.what_changed}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-xs text-muted-foreground italic">
                      No synthesis generated yet. Click to view dossier and trigger analysis.
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    {analysis ? (
                      <>
                        <Icon name="schedule" size={13} className="text-muted-foreground" />
                        {new Date(analysis.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </>
                    ) : (
                      'Pending initial run'
                    )}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    <span>View Report</span>
                    <Icon name="arrow_forward" size={13} />
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
