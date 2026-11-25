import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * KeyEvents: list of critical financial events detected in current news scrape.
 * Source links styled with ExternalLink icon.
 */
export default function KeyEvents({ events = [] }) {
  return (
    <Card className="bg-white border border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-slate-700" />
          <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
            Key Events {events.length > 0 && `(${events.length})`}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        {!events || events.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No specific events cataloged for this intelligence run.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {events.map((evt, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                    {evt.title}
                  </h4>
                  {evt.source_url && (
                    <a
                      href={evt.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-800 shrink-0 hover:underline min-h-[28px]"
                      title="Open source coverage"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {evt.detail && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evt.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
