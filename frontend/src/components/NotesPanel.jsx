import React, { useState } from 'react';
import { StickyNote, Send, Sparkles } from 'lucide-react';

/**
 * NotesPanel: allows financial analysts to jot down observations,
 * which are fed directly into the system's evolving memory context.
 */
export default function NotesPanel({ notes = [], onAddNote, loading = false }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      await onAddNote(content.trim());
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to record note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-card notes-card">
      <div className="section-header">
        <div className="section-title">
          <StickyNote size={18} className="section-title-icon" />
          <span>Analyst Notes ({notes.length})</span>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Notes directly augment the system's memory and steer future news intelligence runs.
      </p>

      <form onSubmit={handleSubmit} className="notes-input-box">
        <textarea
          className="notes-textarea"
          placeholder="Add analyst context, hypotheses, or key management targets to watch (Cmd/Ctrl + Enter to save)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitting}
        />
        {error && (
          <div style={{ color: 'var(--sentiment-neg-text)', fontSize: '0.78rem' }}>
            {error}
          </div>
        )}
        <div className="notes-input-footer">
          <span className="notes-hint">Saved notes become part of memory</span>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            disabled={!content.trim() || submitting}
          >
            <Send size={13} />
            <span>{submitting ? 'Saving...' : 'Add Note'}</span>
          </button>
        </div>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>
            No analyst notes yet. Add one above to seed the memory graph!
          </p>
        ) : (
          notes.map((item) => {
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent';

            return (
              <div key={item.id} className="note-bubble">
                <div className="note-bubble-header">
                  <span className="note-author">Analyst Memory Node</span>
                  <span className="note-date">{dateStr}</span>
                </div>
                <p className="note-body">{item.note}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
