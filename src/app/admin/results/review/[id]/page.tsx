'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Radio,
  Image as ImageIcon,
  Share2,
  Sparkles,
  ExternalLink,
  Crown,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/status-pill';
import { Modal } from '@/components/ui/modal';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime, formatDate, formatDateTime } from '@/lib/utils/formatters';

export default function ResultReviewPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [state, setState] = React.useState(dbStore.getState());
  const [isAnnouncing, setIsAnnouncing] = React.useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = React.useState(false);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const program = state.programs.find((p) => p.id === programId);
  const results = state.results[programId] || [];

  if (!program) {
    return <div className="p-8 text-center text-slate-400">Program not found.</div>;
  }

  const isAnnounced = program.status === 'ANNOUNCED';

  const handleAnnounceResults = () => {
    setIsAnnouncing(true);

    setTimeout(() => {
      // Trigger celebration confetti
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      // Mint immutable snapshot data
      const now = new Date().toISOString();
      const updatedResults = results.map((res) => ({
        ...res,
        is_locked: true,
        snapshot_data: {
          student_name: res.participant_name,
          student_code: res.participant_number.toString(),
          group_name: res.group_name || 'Individual',
          program_name: program.name,
          category_name: program.category_name || 'Competition',
          division_name: program.division_name || 'Division',
          announced_at: now,
        },
      }));

      dbStore.setState((prev) => ({
        ...prev,
        results: {
          ...prev.results,
          [programId]: updatedResults,
        },
        programs: prev.programs.map((p) =>
          p.id === programId
            ? {
                ...p,
                status: 'ANNOUNCED',
                result_status: 'ANNOUNCED',
                announced_at: now,
                announced_by: prev.profile.id,
              }
            : p
        ),
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            organization_id: prev.organization.id,
            user_email: prev.profile.email,
            action: 'ANNOUNCE_RESULTS',
            entity_name: 'program_result',
            entity_id: programId,
            new_values: {
              status: 'ANNOUNCED',
              program: program.name,
              winners: updatedResults.slice(0, 3).map((r) => r.participant_name),
            },
            created_at: now,
          },
          ...prev.auditLogs,
        ],
      }));

      setIsAnnouncing(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/results">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-700 font-mono text-xs font-black rounded-md">
                {program.program_code}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {program.name}
              </h1>
              <StatusPill status={program.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Result Review & Official Announcement Console
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAnnounced && (
            <Link href={`/programs/${program.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1.5" /> Public View
              </Button>
            </Link>
          )}

          <Link href={`/admin/posters?programId=${program.id}`}>
            <Button variant="secondary" size="sm">
              <ImageIcon className="w-4 h-4 mr-1.5 text-blue-400" /> Generate Poster
            </Button>
          </Link>

          {!isAnnounced && (
            <Button
              onClick={handleAnnounceResults}
              variant="success"
              size="sm"
              isLoading={isAnnouncing}
              disabled={results.length === 0}
            >
              <Radio className="w-4 h-4 mr-1.5 animate-pulse" /> Announce Results Publicly
            </Button>
          )}
        </div>
      </div>

      {/* Announcement Status Banner */}
      {isAnnounced ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex items-center justify-between gap-4 text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold">Results Officially Announced & Certified</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Timestamp: {formatDateTime(program.announced_at)} • Standings are live on public portals & TV displays.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Lock className="w-4 h-4" /> Locked & Audited
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-center justify-between gap-4 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">Pending Administrative Authorization</h4>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Review computed ranks and marks below. Clicking 'Announce Results' will broadcast the standings to the live projector and student portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Official Standings Table */}
      <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Official Program Standings</span>
            </CardTitle>
            <CardDescription>
              Rank assignments calculated via Olympic Criteria Scoring Matrix
            </CardDescription>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank / Position</TableHead>
              <TableHead>Chest #</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>House Team</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Points Awarded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length > 0 ? (
              results.map((res, idx) => (
                <TableRow
                  key={res.id || idx}
                  className={
                    res.position_rank === 1
                      ? 'bg-amber-50/40 dark:bg-amber-950/20'
                      : res.position_rank === 2
                      ? 'bg-slate-50/70 dark:bg-slate-800/30'
                      : ''
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          res.position_rank === 1
                            ? 'bg-amber-400 text-slate-900 shadow-sm shadow-amber-500/30'
                            : res.position_rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                            : res.position_rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {res.position_rank || idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {res.position_name || 'Participant'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    #{res.participant_number}
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {res.participant_name}
                    </p>
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
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {res.total_marks}
                    </span>
                    <span className="text-xs text-slate-400"> / 100</span>
                  </TableCell>

                  <TableCell>
                    {res.grade_name ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
                        {res.grade_name}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      +{res.points_awarded} <span className="text-xs font-bold">pts</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  No results computed yet. Please complete score entry in the Judging Portal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
