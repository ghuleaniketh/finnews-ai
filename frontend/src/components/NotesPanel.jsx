import React, { useState } from 'react';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/**
 * NotesPanel: allows financial analysts to add observations,
 * which are fed directly into the system's evolving memory context.
 */
export default function NotesPanel({ notes = [], onAddNote }) {
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
      setError(err.message || 'Failed to record analyst note.');
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
    <Card className="bg-card border-border shadow-xs space-y-4">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <div className="flex items-center gap-2">
          <Icon name="note_add" size={16} className="text-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
            Analyst Notes {notes.length > 0 && `(${notes.length})`}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Analyst observations directly augment the institutional memory graph and steer future news intelligence runs.
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        {/* Note Input Box */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            className="min-h-[90px] text-xs bg-muted/50 border-border focus-visible:bg-card resize-y"
            placeholder="Add analyst context, hypotheses, or key management targets to watch (Cmd/Ctrl + Enter to save)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
          />

          {error && (
            <p className="text-xs text-[#9B3B2E] font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              Saved notes become part of memory
            </span>
            <Button
              type="submit"
              disabled={!content.trim() || submitting}
              className="h-10 min-h-[40px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs"
            >
              {submitting ? (
                <>
                  <Icon name="progress_activity" size={14} className="animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="send" size={14} className="mr-1.5" />
                  <span>Add note</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Notes List */}
        <div className="pt-2 border-t border-border space-y-2.5">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              No analyst notes recorded yet. Add one above to seed the memory graph.
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
                <div
                  key={item.id}
                  className="p-3 rounded-md bg-muted border border-border space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground uppercase tracking-wider">
                      Analyst Memory Node
                    </span>
                    <span className="font-mono">{dateStr}</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {item.note}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
