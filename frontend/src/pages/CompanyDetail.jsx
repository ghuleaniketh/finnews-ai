import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import AnalyzeButton from '../components/AnalyzeButton';
import SummaryCard from '../components/SummaryCard';
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

const ANALYSIS_STAGES = [
  'Searching news…',
  'Recalling memory…',
  'Analyzing…',
  'Saving…',
];

/**
 * CompanyDetail: Deep-dive view for a specific company or topic.
 * Features evolving memory diff, historical timeline, sentiment chart,
 * notes panel, key events, and primary sources.
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

  // Trigger automated analysis run
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
    return <Loader message={`Synthesizing intelligence dossier for ${company?.name || 'entity'}...`} />;
  }

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Top Breadcrumb and Header */}
      <div style={{ marginBottom: '14px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>{company?.name}</span>
            {company?.ticker && (
              <span className="company-ticker-badge">{company.ticker}</span>
            )}
          </h1>
          <p>
            Continuous intelligence feed correlated with retained financial memory
          </p>
        </div>

        <div className="header-actions">
          <AnalyzeButton
            onAnalyze={handleAnalyze}
            loading={analyzing}
            loadingText={currentStageText}
            label="Analyze now"
          />
        </div>
      </div>

      {/* Analyzing Progress Notice Banner */}
      {analyzing && (
        <div className="analyzing-notice-bar">
          <div className="analyzing-notice-text">
            <div className="pulse-spinner" />
            <div>
              <strong>Deep Scrape & Memory Correlation:</strong>{' '}
              <span className="analyzing-stage-pill">{currentStageText}</span>
            </div>
          </div>
          <div className="analyzing-stages-stepper">
            {ANALYSIS_STAGES.map((stage, idx) => (
              <span
                key={stage}
                className={`stage-step-tag ${idx === stageIndex ? 'active' : ''}`}
              >
                {stage}
              </span>
            ))}
          </div>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Sparkles size={28} />
          </div>
          <h3 className="empty-state-title">No Intelligence Generated Yet</h3>
          <p className="empty-state-desc">
            Click <strong>"Analyze now"</strong> above to trigger the autonomous news scraper. It will
            extract key events, compute sentiment, identify recurring themes, and build the initial
            memory graph for {company?.name}.
          </p>
          <AnalyzeButton
            onAnalyze={handleAnalyze}
            loading={analyzing}
            loadingText={currentStageText}
            label="Run First Analysis"
          />
        </div>
      ) : (
        <>
          {/* Active / Inspected Analysis Summary */}
          {selectedAnalysis && (
            <>
              {/* Highlight "What Changed Since Last Time" */}
              <WhatChanged
                whatChanged={selectedAnalysis.what_changed}
                previousDate={selectedAnalysis.created_at}
              />

              {/* Main Headline & Metadata */}
              <SummaryCard
                headline={selectedAnalysis.headline}
                summary={selectedAnalysis.summary}
                sentiment={selectedAnalysis.sentiment}
                riskLevel={selectedAnalysis.risk_level}
                entities={selectedAnalysis.entities}
                createdAt={selectedAnalysis.created_at}
              />
            </>
          )}

          {/* 2-Column Responsive Detail Layout */}
          <div className="detail-grid-layout">
            {/* Main Primary Content Column */}
            <div className="detail-main-col">
              {/* Key Events detected in the scrape */}
              {selectedAnalysis && (
                <KeyEvents events={selectedAnalysis.key_events} />
              )}

              {/* Recurring Strategic Themes */}
              {selectedAnalysis && (
                <ThemesList themes={selectedAnalysis.recurring_themes} />
              )}

              {/* Memory Used Panel (What was recalled from prior runs / notes) */}
              {selectedAnalysis && (
                <MemoryPanel
                  memoryItems={
                    selectedAnalysis.memory_used && selectedAnalysis.memory_used.length > 0
                      ? selectedAnalysis.memory_used
                      : memoryItems
                  }
                />
              )}

              {/* Scraped Sources List */}
              {selectedAnalysis && (
                <SourcesList sources={selectedAnalysis.sources} />
              )}
            </div>

            {/* Side Column: History Timeline + Sentiment Chart + Analyst Notes */}
            <div className="detail-side-col">
              {/* Interactive Timeline with Recharts sentiment trend */}
              <HistoryTimeline
                analyses={analyses}
                selectedId={selectedAnalysis?.id}
                onSelectAnalysis={(item) => setSelectedAnalysis(item)}
              />

              {/* Analyst Notes Panel */}
              <NotesPanel
                notes={notes}
                onAddNote={handleAddNote}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
