'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { getStatusBadgeVariant } from '@/lib/utils/formatters';

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const variantClass = getStatusBadgeVariant(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all',
        variantClass,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
}
