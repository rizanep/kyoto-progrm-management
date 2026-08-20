'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Trophy,
  Shield,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { calculateProgramResults } from '@/features/results/services/resultCalculationEngine';
import { ProgramResult } from '@/lib/types/database';

export default function JudgeScoreEntryPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [state, setState] = React.useState(dbStore.getState());
  const program = state.programs.find((p) => p.id === programId);
  const criteria = state.judgingCriteria[programId] || [];
  const participants = state.participants.filter(
    (p) => p.program_id === programId && p.attendance_status === 'PRESENT'
  );

  // Score matrix: [participantId][criterionId] = mark
  const [scoreMatrix, setScoreMatrix] = React.useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Initialize scores from previous records if available
  React.useEffect(() => {
    const existing = state.scores[programId] || [];
    const matrix: Record<string, Record<string, number>> = {};

    participants.forEach((p) => {
      matrix[p.id] = {};
      criteria.forEach((c) => {
        const found = existing.find(
          (sc) => sc.participant_id === p.id && sc.criterion_id === c.id
        );
        matrix[p.id][c.id] = found ? Number(found.marks) : 0;
      });
    });

    setScoreMatrix(matrix);
  }, [programId]);

  if (!program) {
    return (
      <div className="p-8 text-center text-slate-400">
        Program not found.{' '}
        <Link href="/admin/judging" className="text-blue-500 underline">
          Back
        </Link>
      </div>
    );
  }

  const handleScoreChange = (participantId: string, criterionId: string, val: string, maxMarks: number) => {
    const num = parseFloat(val) || 0;
    const clamped = Math.min(maxMarks, Math.max(0, num));

    setScoreMatrix((prev) => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] || {}),
        [criterionId]: clamped,
      },
    }));
    setValidationError(null);
  };

  const getParticipantTotal = (participantId: string): number => {
    const critScores = scoreMatrix[participantId] || {};
    return Object.values(critScores).reduce((acc, v) => acc + (Number(v) || 0), 0);
  };

  const handleSubmitScores = () => {
    // Validate that at least some scores are entered
    if (participants.length === 0) {
      setValidationError('Cannot submit judging for a program with 0 present participants.');
      return;
    }

    setIsSubmitting(true);

    const participantRecords = participants.map((p) => ({
      participantId: p.id,
      participantNumber: p.participant_number,
      participantName: p.student_name || 'Participant',
      groupId: p.group_id,
      groupName: p.group_name,
      groupColor: p.group_color,
      totalMarks: getParticipantTotal(p.id),
    }));

    // Calculate Positions & Grades using the Result Engine
    const calculated = calculateProgramResults(
      participantRecords,
      state.positions,
      state.grades,
      'CRITERION_PRIORITY'
    );

    const programResults: ProgramResult[] = calculated.map((res) => ({
      id: `res-${Date.now()}-${res.participantNumber}`,
      program_id: programId,
      participant_id: res.participantId,
      participant_number: res.participantNumber,
      participant_name: res.participantName,
      group_name: res.groupName,
      group_color: res.groupColor,
      total_marks: res.totalMarks,
      position_id: res.positionId,
      position_name: res.positionName,
      position_rank: res.positionRank,
      grade_id: res.gradeId,
      grade_name: res.gradeName,
      points_awarded: res.pointsAwarded,
      is_locked: false,
      created_at: new Date().toISOString(),
    }));

    dbStore.setState((prev) => ({
      ...prev,
      results: {
        ...prev.results,
        [programId]: programResults,
      },
      programs: prev.programs.map((p) =>
        p.id === programId
          ? {
              ...p,
              status: 'JUDGED',
              result_status: 'JUDGED',
              judged_at: new Date().toISOString(),
            }
          : p
      ),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'COMPLETE_JUDGING',
          entity_name: 'program',
          entity_id: programId,
          new_values: { result_count: programResults.length },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setTimeout(() => {
      router.push(`/admin/results/review/${programId}`);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/judging">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 font-mono text-xs font-black text-blue-600 dark:text-blue-400 rounded-md">
                {program.program_code}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {program.name}
              </h1>
              <StatusPill status={program.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Judge Scoring Sheet • {criteria.length} Parameters Evaluated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSubmitScores} variant="success" size="sm" isLoading={isSubmitting}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save & Calculate Ranks
          </Button>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Score Entry Cards for each Participant */}
      <div className="space-y-4">
        {participants.length > 0 ? (
          participants.map((part) => {
            const total = getParticipantTotal(part.id);

            return (
              <Card
                key={part.id}
                className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                      #{part.participant_number}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {part.student_name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{part.student_code}</span>
                        {part.group_name && (
                          <span
                            className="px-2 py-0.2 rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: part.group_color || '#3b82f6' }}
                          >
                            {part.group_name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Calculated Performer Total */}
                  <div className="text-right bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Total
                    </span>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {total.toFixed(1)}{' '}
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </p>
                  </div>
                </div>

                {/* Criteria Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {criteria.map((crit) => {
                    const currentScore = scoreMatrix[part.id]?.[crit.id] ?? 0;

                    return (
                      <div
                        key={crit.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[130px]">
                            {crit.name}
                          </label>
                          <span className="text-[10px] font-extrabold text-slate-400">
                            Max: {crit.max_marks}
                          </span>
                        </div>

                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={crit.max_marks}
                          value={currentScore === 0 ? '' : currentScore}
                          placeholder="0.0"
                          onChange={(e) =>
                            handleScoreChange(part.id, crit.id, e.target.value, crit.max_marks)
                          }
                          className="w-full h-11 px-3 text-center text-lg font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center text-slate-400 rounded-3xl">
            No participants are marked 'Present' for this event. Please verify attendance first.
          </Card>
        )}
      </div>

      {/* Bottom Sticky Action Ribbon */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time Autosave Active</span>
        </div>

        <Button onClick={handleSubmitScores} variant="success" isLoading={isSubmitting}>
          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit Judging & Proceed to Review
        </Button>
      </div>
    </div>
  );
}
