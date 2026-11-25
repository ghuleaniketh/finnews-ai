import React from 'react';
import { Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ThemesList: recurring market narratives and strategic themes tracked over time.
 */
export default function ThemesList({ themes = [] }) {
  if (!themes || themes.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-slate-700" />
          <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
            Recurring Themes ({themes.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {themes.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 leading-snug">
                  {item.theme}
                </span>
              </div>
              {item.note && (
                <p className="text-xs text-slate-600 pl-3.5 leading-relaxed">
                  {item.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
