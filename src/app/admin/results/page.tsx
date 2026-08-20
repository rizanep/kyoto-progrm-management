'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trophy, Search, CheckCircle2, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/shared/status-pill';
import { Badge } from '@/components/ui/badge';
import { dbStore } from '@/lib/store/mockDatabase';

export default function ResultsDirectoryPage() {
  const [programs, setPrograms] = React.useState(dbStore.getState().programs);
  const [results, setResults] = React.useState(dbStore.getState().results);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setPrograms(dbStore.getState().programs);
      setResults(dbStore.getState().results);
    });
  }, []);

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.program_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Results Review & Announcement Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit judged scores, authorize public announcements, and mint immutable result snapshots.
          </p>
        </div>

        <Link href="/results" target="_blank">
          <Button variant="outline" size="sm">
            View Public Standings Portal
          </Button>
        </Link>
      </div>

      {/* Program Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prog) => {
          const progResults = results[prog.id] || [];
          const isAnnounced = prog.status === 'ANNOUNCED';
          const isJudged = prog.status === 'JUDGED';

          return (
            <Card
              key={prog.id}
              className={`p-6 rounded-3xl flex flex-col justify-between ${
                isAnnounced
                  ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : isJudged
                  ? 'border-amber-500/40 dark:border-amber-500/30'
                  : ''
              }`}
              hoverEffect
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black rounded-lg">
                    {prog.program_code}
                  </span>
                  <StatusPill status={prog.status} />
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                  {prog.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {prog.category_name} • {prog.division_name}
                </p>

                {progResults.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Top Position Preview
                    </span>
                    <div className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-[10px] font-black text-slate-900 flex items-center justify-center">
                          1
                        </span>
                        {progResults[0]?.participant_name}
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {progResults[0]?.total_marks} marks
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Scoring incomplete. Awaiting judges.
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {isAnnounced ? (
                  <Badge variant="success">Announced Publicly</Badge>
                ) : isJudged ? (
                  <Badge variant="warning">Ready to Announce</Badge>
                ) : (
                  <Badge variant="default">In Progress</Badge>
                )}

                <Link href={`/admin/results/review/${prog.id}`}>
                  <Button size="sm" variant={isJudged ? 'warning' : 'outline'}>
                    Review Results <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
