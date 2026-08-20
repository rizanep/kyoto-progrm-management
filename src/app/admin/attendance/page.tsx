'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClipboardCheck, Search, Filter, Play, CheckCircle2, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime, formatDate } from '@/lib/utils/formatters';

export default function AttendanceOverviewPage() {
  const [programs, setPrograms] = React.useState(dbStore.getState().programs);
  const [participants] = React.useState(dbStore.getState().participants);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setPrograms(dbStore.getState().programs);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          <span>Competition Attendance Roll</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify participant reporting, identify absentees, and initialize judging stage readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((prog) => {
          const progParticipants = participants.filter((p) => p.program_id === prog.id);
          const presentCount = progParticipants.filter((p) => p.attendance_status === 'PRESENT').length;

          return (
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
                <p className="text-xs text-slate-400 mb-4">
                  {prog.category_name} • {prog.venue || 'Venue TBD'}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Registered:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {progParticipants.length} Participants
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Marked Present:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {presentCount} / {progParticipants.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end">
                <Link href={`/admin/programs/${prog.id}`}>
                  <Button size="sm">Open Attendance Sheet</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
