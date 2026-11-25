import React from 'react';
import { Brain, Cpu } from 'lucide-react';
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
    <Card className="bg-white border border-border shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-700" />
            <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
              Memory Recalled & Applied
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono text-slate-600 bg-slate-50 border-slate-200">
            <Cpu className="h-3 w-3 mr-1 text-slate-500" />
            Context Graph
          </Badge>
        </div>
        <p className="text-xs text-slate-500 pt-1">
          Historical analyst findings and prior news syntheses integrated into this run:
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        <div className="space-y-2">
          {memoryItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
