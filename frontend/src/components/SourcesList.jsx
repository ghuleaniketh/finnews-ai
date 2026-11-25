import React from 'react';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * SourcesList: scraped articles and primary financial reporting sources.
 */
export default function SourcesList({ sources = [] }) {
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'external';
    }
  };

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Icon name="link" size={16} className="text-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
            Sources {sources.length > 0 && `(${sources.length})`}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        {!sources || sources.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No primary sources linked for this entry.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-3 rounded-md bg-muted hover:bg-accent border border-border transition-colors min-h-[40px]"
                title={item.title}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-foreground group-hover:underline line-clamp-2 leading-snug">
                    {item.title}
                  </span>
                  <Icon name="open_in_new" size={13} className="text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground mt-2">
                  {getDomain(item.url)}
                </span>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
