import React from 'react';
import { GitCompare, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * WhatChanged: prominent card highlighting intelligence diff since last run.
 * Formal light design with a subtle left border, NOT a glow.
 */
export default function WhatChanged({ whatChanged }) {
  if (!whatChanged) return null;

  return (
    <Card className="bg-white border border-border border-l-4 border-l-blue-700 shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-blue-700" />
            <h3 className="font-semibold text-sm text-slate-900 tracking-tight">
              What Changed Since Last Run
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <Sparkles className="h-3 w-3 text-blue-700" />
            <span>Memory Shift</span>
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {whatChanged}
        </p>
      </CardContent>
    </Card>
  );
}
