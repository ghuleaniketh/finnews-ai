import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';
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
    <Card className="bg-white border border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-slate-700" />
          <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
            Sources {sources.length > 0 && `(${sources.length})`}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        {!sources || sources.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
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
                className="group flex flex-col justify-between p-3 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors min-h-[40px]"
                title={item.title}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-slate-800 group-hover:text-blue-800 line-clamp-2 leading-snug">
                    {item.title}
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-700 shrink-0 mt-0.5" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-2">
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
