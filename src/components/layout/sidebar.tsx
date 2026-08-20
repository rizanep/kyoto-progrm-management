'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Layers,
  Sparkles,
  ClipboardCheck,
  Scale,
  Trophy,
  Image as ImageIcon,
  Settings,
  History,
  Radio,
  ExternalLink,
  GraduationCap,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/avatar';
import { dbStore } from '@/lib/store/mockDatabase';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [profile, setProfile] = React.useState(dbStore.getState().profile);

  React.useEffect(() => {
    setMounted(true);
    setProfile(dbStore.getState().profile);
    return dbStore.subscribe(() => {
      setProfile(dbStore.getState().profile);
    });
  }, []);

  const navSections = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Students', href: '/admin/students', icon: <Users className="w-4 h-4" /> },
        { name: 'Classes & Sections', href: '/admin/classes', icon: <GraduationCap className="w-4 h-4" /> },
        { name: 'House Groups', href: '/admin/groups', icon: <ShieldAlert className="w-4 h-4" /> },
      ],
    },
    {
      title: 'COMPETITION',
      items: [
        { name: 'Programs', href: '/admin/programs', icon: <Layers className="w-4 h-4" /> },
        { name: 'Attendance', href: '/admin/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
        { name: 'Judging Portal', href: '/admin/judging', icon: <Scale className="w-4 h-4" /> },
        { name: 'Results & Review', href: '/admin/results', icon: <Trophy className="w-4 h-4" /> },
      ],
    },
    {
      title: 'PUBLISHING',
      items: [
        { name: 'Poster Studio', href: '/admin/posters', icon: <ImageIcon className="w-4 h-4" /> },
        { name: 'Live Display', href: '/live', icon: <Tv className="w-4 h-4 text-emerald-400" />, badge: 'LIVE' },
        { name: 'Public Portal', href: '/programs', icon: <ExternalLink className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Settings & Matrix', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
        { name: 'Audit Logs', href: '/admin/audit', icon: <History className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-[#0c131d] text-slate-400 flex flex-col justify-between p-3.5 h-[calc(100vh-1rem)] m-2 rounded-[28px] select-none border border-slate-800/80 shadow-2xl shrink-0 transition-all duration-300 z-40',
        className
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="px-3 py-3 flex items-center justify-between border-b border-slate-800/60 pb-4 mb-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1">
              <span>Program</span>
              <span className="text-blue-400">Hub</span>
            </span>
          </Link>
          <div className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-black text-slate-300 border border-slate-700">
            PRO
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold text-slate-500 tracking-wider mb-1.5 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                        isActive
                          ? 'bg-[#1e293b] text-white shadow-sm font-bold border-l-4 border-blue-500 pl-2.5'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn('transition-colors', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-500/30 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Pill at Bottom (matching the screenshot) */}
      <div className="pt-3 border-t border-slate-800/60 mt-2">
        <Link
          href="/login"
          title="Click to Switch Account / Sign Out"
          className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name}
              fallbackText={profile.full_name}
              size="sm"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <p suppressHydrationWarning className="text-xs font-bold text-white truncate">
                  {profile.full_name}
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p suppressHydrationWarning className="text-[10px] text-slate-400 truncate font-mono">
                📱 {profile.phone || '8281740483'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">
            Exit
          </span>
        </Link>
      </div>
    </aside>
  );
}
