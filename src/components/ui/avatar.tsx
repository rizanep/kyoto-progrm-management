'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, alt = 'Avatar', fallbackText, size = 'md', className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (text?: string) => {
    if (!text) return 'U';
    const parts = text.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 font-semibold overflow-hidden select-none shrink-0 border border-slate-200/60 dark:border-slate-700/60',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(fallbackText || alt)}</span>
      )}
    </div>
  );
}
