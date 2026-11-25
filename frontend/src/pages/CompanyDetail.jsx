import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import AnalyzeButton from '../components/AnalyzeButton';
import SummaryCard, { RiskBadge } from '../components/SummaryCard';
import SentimentBadge from '../components/SentimentBadge';
import WhatChanged from '../components/WhatChanged';
import KeyEvents from '../components/KeyEvents';
import ThemesList from '../components/ThemesList';
import MemoryPanel from '../components/MemoryPanel';
import SourcesList from '../components/SourcesList';
import HistoryTimeline from '../components/HistoryTimeline';
import NotesPanel from '../components/NotesPanel';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import {
  getAnalyses,
  getNotes,
  addNote,
  getMemory,
  triggerAnalysis,
} from '../api/endpoints';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ANALYSIS_STAGES = [
  'Searching news…',
  'Recalling memory…',
  'Analyzing…',
  'Saving…',
];

/**
 * CompanyDetail: Deep-dive view for a specific company or topic.
 * Features:
 * - Header with company name, ticker, sentiment Badge, risk Badge, and Analyze button.
 * - Slim alert for rotating staged progress during analysis.
 * - Tabs for Analysis | History | Notes so the page isn't one long scroll on mobile.
 * - Content organized with Cards in exact order:
 *   1) Summary
 *   2) What changed (subtle left border, not a glow)
 *   3) Key events (ExternalLink icon)
 *   4) Recurring themes
 *   5) Memory used
 *   6) Sources
 */
export default function CompanyDetail({ watchlist = [] }) {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [notes, setNotes] = useState([]);
  const [memoryItems, setMemoryItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState(null);

  // Timed rotation for staged progress during analysis
  useEffect(() => {
    if (!analyzing) {
      setStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % ANALYSIS_STAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [analyzing]);

  const currentStageText = ANALYSIS_STAGES[stageIndex];

  // Match company from top-level watchlist or fallback
  useEffect(() => {
    const found = watchlist.find((item) => String(item.id) === String(id));
    if (found) {
      setCompany(found);
    } else {
      setCompany({ id, name: 'Company Details', ticker: '' });
    }
  }, [id, watchlist]);

  // Load all company artifacts: analyses, notes, and memory items
  const loadCompanyData = async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const [analysesData, notesData, memoryData] = await Promise.all([
        getAnalyses(companyId).catch(() => []),
        getNotes(companyId).catch(() => []),
        getMemory(companyId).catch(() => ({ items: [] })),
      ]);

      setAnalyses(analysesData);
      setSelectedAnalysis(analysesData[0] || null);
      setNotes(notesData);
      setMemoryItems(memoryData.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCompanyData(id);
    }
  }, [id]);

  // Trigger automated analysis run (preserves 180000ms logic)
  const handleAnalyze = async () => {
    if (analyzing || !id) return;

    setAnalyzing(true);
    setError(null);
    try {
      const newAnalysis = await triggerAnalysis({ watchlist_id: id, max_articles: 10 });

      // Update analyses list (newest first)
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedAnalysis(newAnalysis);

      // Refresh memory items to reflect new synthesis node
      const updatedMem = await getMemory(id).catch(() => null);
      if (updatedMem?.items) {
        setMemoryItems(updatedMem.items);
      }
    } catch (err) {
      setError(err.message || 'Analysis run failed. Please check server status.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Add analyst note
  const handleAddNote = async (noteText) => {
    const createdNote = await addNote({ watchlist_id: id, note: noteText });
    setNotes((prev) => [createdNote, ...prev]);

    // Also update memory items
    const updatedMem = await getMemory(id).catch(() => null);
    if (updatedMem?.items) {
      setMemoryItems(updatedMem.items);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-white rounded-lg border border-border">
        <Loader message={`Synthesizing intelligence dossier for ${company?.name || 'entity'}...`} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors min-h-[40px] py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header: Company Name, Ticker, Sentiment Badge, Risk Badge, and Analyze Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {company?.name}
            </h1>
            {company?.ticker && (
              <span className="font-mono text-xs uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {company.ticker}
              </span>
            )}
            {selectedAnalysis && (
              <>
                <SentimentBadge sentiment={selectedAnalysis.sentiment} />
                <RiskBadge riskLevel={selectedAnalysis.risk_level} />
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Continuous intelligence feed correlated with retained institutional memory.
          </p>
        </div>

        <div className="shrink-0 flex items-center">
          <AnalyzeButton
            onAnalyze={handleAnalyze}
            loading={analyzing}
            loadingText={currentStageText}
            label="Analyze now"
          />
        </div>
      </div>

      {/* Staged Progress Slim Alert Area under Header */}
      {analyzing && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-900 p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-700 shrink-0" />
            <div className="text-xs truncate">
              <span className="font-semibold text-blue-950">Deep Scrape & Memory Synthesis:</span>{' '}
              <span className="font-mono font-medium text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded border border-blue-200 ml-1">
                {currentStageText}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            {ANALYSIS_STAGES.map((stage, idx) => (
              <span
                key={stage}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  idx === stageIndex
                    ? 'bg-blue-700 text-white font-semibold shadow-2xs'
                    : 'text-slate-400'
                }`}
              >
                {stage}
              </span>
            ))}
          </div>
        </Alert>
      )}

      {/* Main View Area: Empty state or Tabs */}
      {analyses.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8 bg-white border border-border shadow-xs">
          <CardHeader className="p-0 pb-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              No Intelligence Generated Yet
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 max-w-xs mt-1">
              Click "Analyze now" above to trigger autonomous news scraping. It will extract key events,
              compute sentiment, identify recurring themes, and build initial memory for {company?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <AnalyzeButton
              onAnalyze={handleAnalyze}
              loading={analyzing}
              loadingText={currentStageText}
              label="Run First Analysis"
            />
          </CardContent>
        </Card>
      ) : (
        /* Tabs for Analysis | History | Notes so the page isn't one long scroll on mobile */
        <Tabs defaultValue="analysis" className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-10 p-1 bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="analysis"
              className="text-xs sm:text-sm font-medium h-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm font-medium h-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
            >
              History ({analyses.length})
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="text-xs sm:text-sm font-medium h-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
            >
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab: Exact requested card order:
              1) Summary
              2) What changed (subtle left border, not a glow)
              3) Key events (ExternalLink icon)
              4) Recurring themes
              5) Memory used
              6) Sources
          */}
          <TabsContent value="analysis" className="space-y-4 pt-1">
            {selectedAnalysis && (
              <>
                {/* 1) Summary */}
                <SummaryCard
                  headline={selectedAnalysis.headline}
                  summary={selectedAnalysis.summary}
                  sentiment={selectedAnalysis.sentiment}
                  riskLevel={selectedAnalysis.risk_level}
                  entities={selectedAnalysis.entities}
                  createdAt={selectedAnalysis.created_at}
                />

                {/* 2) What changed (highlighted with a subtle left border, not a glow) */}
                <WhatChanged
                  whatChanged={selectedAnalysis.what_changed}
                  previousDate={selectedAnalysis.created_at}
                />

                {/* 3) Key events (source links with ExternalLink icon) */}
                <KeyEvents events={selectedAnalysis.key_events} />

                {/* 4) Recurring themes */}
                <ThemesList themes={selectedAnalysis.recurring_themes} />

                {/* 5) Memory used */}
                <MemoryPanel
                  memoryItems={
                    selectedAnalysis.memory_used && selectedAnalysis.memory_used.length > 0
                      ? selectedAnalysis.memory_used
                      : memoryItems
                  }
                />

                {/* 6) Sources */}
                <SourcesList sources={selectedAnalysis.sources} />
              </>
            )}
          </TabsContent>

          {/* History Tab: timeline list plus sentiment-over-time chart */}
          <TabsContent value="history" className="pt-1">
            <HistoryTimeline
              analyses={analyses}
              selectedId={selectedAnalysis?.id}
              onSelectAnalysis={(item) => setSelectedAnalysis(item)}
            />
          </TabsContent>

          {/* Notes Tab: Textarea + Add note button + notes list */}
          <TabsContent value="notes" className="pt-1">
            <NotesPanel
              notes={notes}
              onAddNote={handleAddNote}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
