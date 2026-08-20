'use client';

import * as React from 'react';
import Link from 'next/link';
import { Scale, Search, Clock, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';

export default function JudgingDashboardPage() {
  const [programs, setPrograms] = React.useState(dbStore.getState().programs);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setPrograms(dbStore.getState().programs);
    });
  }, []);

  const activePrograms = programs.filter(
    (p) => p.status === 'STARTED' || p.status === 'JUDGING' || p.status === 'ATTENDANCE'
  );
  const judgedPrograms = programs.filter((p) => p.status === 'JUDGED' || p.status === 'ANNOUNCED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-600" />
          <span>Judges Scoring Portal</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Authorized jury panel console for real-time score tabulation and criteria evaluation.
        </p>
      </div>

      {/* Active Stage Programs Ready for Judging */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Currently Live on Stage ({activePrograms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePrograms.length > 0 ? (
            activePrograms.map((prog) => (
              <Card
                key={prog.id}
                className="p-6 rounded-3xl border-2 border-blue-500/30 flex flex-col justify-between"
                hoverEffect
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 font-mono text-xs font-black text-blue-600 dark:text-blue-400 rounded-lg">
                      {prog.program_code}
                    </span>
                    <StatusPill status={prog.status} />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {prog.category_name} • {prog.venue}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {prog.participant_count || 0} Performers
                  </span>
                  <Link href={`/admin/judging/${prog.id}`}>
                    <Button size="sm" variant="primary">
                      Enter Score Sheet <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-slate-400 col-span-3 rounded-3xl">
              No programs are actively running on stage right now. Start an event from Programs menu.
            </Card>
          )}
        </div>
      </div>

      {/* Completed Judging History */}
      <div className="space-y-4 pt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Completed & Judged Programs ({judgedPrograms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {judgedPrograms.map((prog) => (
            <Card key={prog.id} className="p-6 rounded-3xl flex flex-col justify-between" hoverEffect>
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
                <p className="text-xs text-slate-400">{prog.category_name}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Badge variant="success">Scored & Audited</Badge>
                <Link href={`/admin/results/review/${prog.id}`}>
                  <Button size="sm" variant="outline">
                    View Results
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
