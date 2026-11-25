import React from 'react';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * KeyEvents: list of critical financial events detected in current news scrape.
 * Source links styled with open_in_new icon and primary link color.
 */
export default function KeyEvents({ events = [] }) {
  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Icon name="newspaper" size={16} className="text-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
            Key Events {events.length > 0 && `(${events.length})`}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        {!events || events.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No specific events cataloged for this intelligence run.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {events.map((evt, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-foreground leading-snug">
                    {evt.title}
                  </h4>
                  {evt.source_url && (
                    <a
                      href={evt.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline shrink-0 min-h-[28px]"
                      title="Open source coverage"
                    >
                      <span>Source</span>
                      <Icon name="open_in_new" size={12} />
                    </a>
                  )}
                </div>
                {evt.detail && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
