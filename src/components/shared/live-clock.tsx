'use client';

import * as React from 'react';

export function LiveClock() {
  const [timeStr, setTimeStr] = React.useState('');
  const [dateStr, setDateStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeStr) {
    return <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />;
  }

  return (
    <div className="hidden md:flex flex-col text-right">
      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-end gap-1">
        <span>{timeStr}</span>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        {dateStr}
      </span>
    </div>
  );
}
