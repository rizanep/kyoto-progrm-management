'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export interface MetricGaugeProps {
  title?: string;
  percentage: number;
  capacity: number | string;
  threshold: number | string;
  unitLabel?: string;
}

export function MetricGauge({
  title = 'Completion & Execution Rate',
  percentage,
  capacity,
  threshold,
  unitLabel = 'Points / Quota',
}: MetricGaugeProps) {
  const safePercent = Math.min(100, Math.max(0, percentage));
  // Needle rotation between -90deg (0%) and 90deg (100%)
  const needleRotation = -90 + (safePercent / 100) * 180;

  return (
    <Card className="flex flex-col justify-between p-6 rounded-3xl h-full">
      <CardHeader className="p-0 border-none pb-2">
        <CardTitle className="text-sm font-bold text-center w-full text-slate-800 dark:text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>

      {/* Semi-circular speedometer gauge */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Gauge Track Arc */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[18px] border-slate-100 dark:border-slate-800" />
          {/* Active Colored Portion */}
          <div
            className="absolute top-0 left-0 w-48 h-48 rounded-full border-[18px] border-blue-500 transition-all duration-700 ease-out"
            style={{
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
              transform: `rotate(${needleRotation}deg)`,
            }}
          />
          {/* Needle Indicator */}
          <div
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 dark:bg-white origin-bottom rounded-full transition-transform duration-700 ease-out -translate-x-1/2"
            style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white shadow-md" />
        </div>

        {/* Big percentage display */}
        <div className="mt-4 text-center">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {safePercent.toFixed(1)}%
          </span>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            {unitLabel}
          </p>
        </div>
      </div>

      {/* Bottom capacity and threshold cards */}
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Target / Cap</span>
          </div>
          <p className="text-lg font-black text-purple-950 dark:text-purple-100 mt-1">
            {capacity}
          </p>
        </div>

        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Threshold</span>
          </div>
          <p className="text-lg font-black text-amber-950 dark:text-amber-100 mt-1">
            {threshold}
          </p>
        </div>
      </div>
    </Card>
  );
}
