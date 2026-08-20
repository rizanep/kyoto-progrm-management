'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  Trophy,
  Menu,
  X,
  Radio,
  Tv,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Sidebar } from '@/components/layout/sidebar';

export function MobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const bottomLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Programs', href: '/admin/programs', icon: <Layers className="w-5 h-5" /> },
    { name: 'Results', href: '/admin/results', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Live', href: '/live', icon: <Tv className="w-5 h-5 text-emerald-500" /> },
  ];

  return (
    <>
      {/* Slide-in Sidebar Drawer on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full p-2 z-10 animate-in slide-in-from-left duration-200">
            <Sidebar className="h-full m-0 w-full" />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-colors',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
