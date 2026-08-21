'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { dbStore } from '@/lib/store/mockDatabase';

export function FacitShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [org, setOrg] = React.useState(dbStore.getState().organization);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setOrg(dbStore.getState().organization);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#090d14] flex text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-2 sm:p-4 lg:p-4 pb-20 lg:pb-4 overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 min-w-0">{children}</main>

        {/* Bottom Footer Bar matching the screenshot */}
        <footer className="mt-8 pt-4 pb-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500 px-2">
          <p>Copyright © 2026 (v 1.0.1) • ProgramHub Production</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Online
            </span>
            <span suppressHydrationWarning className="font-bold text-slate-700 dark:text-slate-300">
              {org.name}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
