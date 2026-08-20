'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  ChevronDown,
  Sun,
  Moon,
  Maximize,
  Radio,
  Bell,
  Menu,
} from 'lucide-react';
import { LiveClock } from '@/components/shared/live-clock';
import { dbStore } from '@/lib/store/mockDatabase';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);
  const [org, setOrg] = React.useState(dbStore.getState().organization);

  React.useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains('dark');
    setIsDark(isDarkTheme);

    return dbStore.subscribe(() => {
      setOrg(dbStore.getState().organization);
    });
  }, []);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains('dark');
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (_) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (_) {}
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Human readable title from pathname
  const formatBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';
    const last = parts[parts.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 px-4 flex items-center justify-between shadow-xs mb-4">
      {/* Left: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="/admin/dashboard"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
          >
            <Home className="w-4 h-4" />
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">{formatBreadcrumb()}</span>
        </div>
      </div>

      {/* Right Controls: Org Selector, Time, Theme, Realtime & Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Organization Selector Pill */}
        <Link
          href="/admin/settings"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Click to change organization or fest details"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          <span suppressHydrationWarning className="max-w-[170px] truncate">{org.name}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Live Clock Widget */}
        <LiveClock />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:block p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Realtime Live Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
          <span>Cloud Sync</span>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black shadow-xs">
            3
          </span>
        </div>
      </div>
    </header>
  );
}
