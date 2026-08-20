'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils/formatters';

export default function PublicProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;

  const [state, setState] = React.useState(dbStore.getState());

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const program = state.programs.find((p) => p.id === programId);
  const results = state.results[programId] || [];

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-slate-400">Program not found.</p>
      </div>
    );
  }

  const isAnnounced = program.status === 'ANNOUNCED';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d14] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/programs" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300">
          <ArrowLeft className="w-4 h-4" /> Back to Programs
        </Link>

        <Link href="/results">
          <Button variant="outline" size="sm" className="text-xs">
            <Trophy className="w-4 h-4 mr-1 text-amber-500" /> Leaderboard
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 font-mono text-xs font-black">
                {program.program_code}
              </span>
              <StatusPill status={program.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {program.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
              {program.description || 'Annual competition event'}
            </p>

            <div className="flex items-center gap-4 text-xs text-blue-200 pt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(program.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatTime(program.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {program.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Results Card if Announced */}
        {isAnnounced ? (
          <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Official Certified Results</span>
                </CardTitle>
                <CardDescription>
                  Announced at {formatDateTime(program.announced_at)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Certified
              </div>
            </CardHeader>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>House Team</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Award Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((res, i) => (
                  <TableRow
                    key={res.id || i}
                    className={res.position_rank === 1 ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                            res.position_rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : res.position_rank === 2
                              ? 'bg-slate-300 dark:bg-slate-600 text-slate-950 dark:text-white'
                              : res.position_rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {res.position_rank || i + 1}
                        </span>
                        <span className="font-bold text-xs">
                          {res.position_name || 'Participant'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {res.participant_name}
                    </TableCell>

                    <TableCell>
                      {res.group_name ? (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                          style={{ backgroundColor: res.group_color || '#3b82f6' }}
                        >
                          {res.group_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {res.grade_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold text-xs border border-blue-200">
                          {res.grade_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                      +{res.points_awarded} pts
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-8 text-center rounded-3xl space-y-2">
            <Lock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Results Awaiting Official Announcement
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Judging evaluation is currently underway. Certified standings will be broadcast here once authorized.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
