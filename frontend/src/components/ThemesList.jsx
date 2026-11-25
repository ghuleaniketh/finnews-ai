import React from 'react';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ThemesList: recurring market narratives and strategic themes tracked over time.
 */
export default function ThemesList({ themes = [] }) {
  if (!themes || themes.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          <Icon name="repeat" size={16} className="text-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
            Recurring Themes ({themes.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {themes.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-md bg-muted border border-border space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B2F24] shrink-0" />
                <span className="text-xs font-semibold text-foreground leading-snug">
                  {item.theme}
                </span>
              </div>
              {item.note && (
                <p className="text-xs text-muted-foreground pl-3.5 leading-relaxed">
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
