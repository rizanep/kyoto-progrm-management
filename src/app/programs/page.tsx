'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Tv,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime, formatDate } from '@/lib/utils/formatters';

export default function PublicProgramsPage() {
  const [state, setState] = React.useState(dbStore.getState());
  const [search, setSearch] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const publicPrograms = state.programs.filter((p) => p.is_public_visible);
  const filtered = publicPrograms.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.program_code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCat || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d14] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/programs" className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Apex Annual Fest <span className="text-blue-600">2026</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/results">
            <Button variant="ghost" size="sm" className="text-xs font-bold">
              <Trophy className="w-4 h-4 mr-1 text-amber-500" /> Standings
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="outline" size="sm" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
              <Tv className="w-4 h-4 mr-1" /> Live TV
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button size="sm" className="text-xs">Admin Console</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50/70 to-transparent dark:from-blue-950/20 py-12 px-4 text-center border-b border-slate-200/60 dark:border-slate-800/60">
        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-xs tracking-wider uppercase inline-block mb-3">
          Official Public Event Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
          Competition Schedule & Certified Standings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2">
          Explore stage performances, literary contests, athletic heats, and real-time certified announcements.
        </p>

        {/* Search & Category Filter */}
        <div className="max-w-2xl mx-auto mt-6 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search programs by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-white dark:bg-slate-900 shadow-sm"
          />
          <Select
            options={state.categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All Categories"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="sm:w-56 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
      </div>

      {/* Programs List */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-4">
        {filtered.map((prog) => {
          const results = state.results[prog.id] || [];
          const isAnnounced = prog.status === 'ANNOUNCED';

          return (
            <Link
              key={prog.id}
              href={`/programs/${prog.id}`}
              className="block group"
            >
              <Card
                className={`p-5 rounded-3xl transition-all ${
                  isAnnounced
                    ? 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/10'
                    : 'hover:border-blue-400'
                }`}
                hoverEffect
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-slate-700 dark:text-slate-300 rounded-md">
                        {prog.program_code}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {prog.name}
                      </h3>
                      <StatusPill status={prog.status} />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {prog.category_name} • {prog.division_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(prog.scheduled_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {prog.venue}
                      </span>
                    </div>

                    {isAnnounced && results.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>Winner: {results[0]?.participant_name} ({results[0]?.group_name})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {isAnnounced ? 'View Results' : 'Event Info'} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>Apex International Academy • Annual Arts & Sports Meet 2026</p>
      </footer>
    </div>
  );
}
