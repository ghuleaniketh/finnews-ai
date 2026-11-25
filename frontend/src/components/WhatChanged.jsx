import React from 'react';
import Icon from './Icon';
import { Card, CardContent } from '@/components/ui/card';

/**
 * WhatChanged: prominent card highlighting intelligence diff since last run.
 * Keeps a subtle left border in the ring/tan color (#B89B6A).
 */
export default function WhatChanged({ whatChanged }) {
  if (!whatChanged) return null;

  return (
    <Card className="bg-card border border-border border-l-4 border-l-[#B89B6A] shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="compare_arrows" size={16} className="text-[#3B2F24]" />
            <h3 className="font-semibold text-sm text-foreground tracking-tight">
              What Changed Since Last Run
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#E8DCC2] text-[#2B2118] border border-[#E3D9C4]">
            <Icon name="auto_awesome" size={12} className="text-[#3B2F24]" />
            <span>Memory Shift</span>
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {whatChanged}
        </p>
      </CardContent>
    </Card>
  );
}
