import React from 'react';
import Icon from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * MemoryPanel: contextual memory nodes recalled and applied during synthesis.
 */
export default function MemoryPanel({ memoryItems = [] }) {
  if (!memoryItems || memoryItems.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="psychology" size={18} className="text-foreground" />
            <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
              Memory Recalled & Applied
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono text-foreground bg-muted border-border">
            <Icon name="memory" size={13} className="mr-1 text-muted-foreground" />
            Context Graph
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Historical analyst findings and prior news syntheses integrated into this run:
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        <div className="space-y-2">
          {memoryItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted border border-border text-xs text-foreground/90 leading-relaxed"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#B89B6A] mt-1.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
