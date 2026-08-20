'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'neutral';
  footerTrend?: string;
  footerStatus?: string;
  footerStatusColor?: string;
  className?: string;
}

export function StatCard({
  title,
  subtitle,
  value,
  icon,
  iconBg = 'bg-blue-50 dark:bg-blue-950/60',
  iconColor = 'text-blue-600 dark:text-blue-400',
  badgeText,
  badgeType = 'success',
  footerTrend,
  footerStatus,
  footerStatusColor = 'text-emerald-600 dark:text-emerald-400',
  className,
}: StatCardProps) {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <Card hoverEffect className={cn('flex flex-col justify-between p-5 rounded-3xl', className)}>
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-2xl flex items-center justify-center', iconBg, iconColor)}>
              {icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {title}
              </h4>
              {subtitle && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {badgeText && (
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', badgeStyles[badgeType])}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Big Bold Stat Value */}
        <div className="mt-4 mb-2 flex items-baseline justify-end">
          <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      {(footerTrend || footerStatus) && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          {footerTrend && (
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              {footerTrend}
            </span>
          )}
          {footerStatus && (
            <span className={cn('font-semibold flex items-center gap-1', footerStatusColor)}>
              {footerStatus}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
