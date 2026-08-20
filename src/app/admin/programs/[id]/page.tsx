'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  Scale,
  Trophy,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  History,
  Printer,
  Search,
  Filter,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusPill } from '@/components/shared/status-pill';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { dbStore } from '@/lib/store/mockDatabase';
import { validateStudentEligibility } from '@/features/programs/services/eligibilityEngine';
import { calculateProgramResults } from '@/features/results/services/resultCalculationEngine';
import { ProgramParticipant, ProgramResult } from '@/lib/types/database';
import { formatTime, formatDate } from '@/lib/utils/formatters';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [state, setState] = React.useState(dbStore.getState());
  const [activeTab, setActiveTab] = React.useState('participants');

  // Participant Assignment Modal States with rich filters
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [searchStudent, setSearchStudent] = React.useState('');
  const [filterClass, setFilterClass] = React.useState('');
  const [filterDivision, setFilterDivision] = React.useState('');
  const [filterGender, setFilterGender] = React.useState('');
  const [filterGroup, setFilterGroup] = React.useState('');
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Direct Mark Entry Matrix (participantId -> marks 0-100)
  const [directMarks, setDirectMarks] = React.useState<Record<string, number>>({});
  const [isSavingScores, setIsSavingScores] = React.useState(false);
  const [scoreFeedback, setScoreFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const program = state.programs.find((p) => p.id === programId);
  const participants = state.participants.filter((p) => p.program_id === programId);
  const rawResults = state.results[programId];
  const results = React.useMemo(() => rawResults || [], [rawResults]);
  const programDivision = state.programDivisions.find((d) => d.id === program?.division_id);

  // Initialize existing marks only when rawResults exist
  React.useEffect(() => {
    if (rawResults && rawResults.length > 0) {
      const marksMap: Record<string, number> = {};
      rawResults.forEach((r) => {
        marksMap[r.participant_id] = r.total_marks;
      });
      setDirectMarks(marksMap);
    }
  }, [programId, rawResults]);

  if (!program) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 mb-4">Program not found.</p>
        <Link href="/admin/programs">
          <Button variant="outline">Back to Programs</Button>
        </Link>
      </div>
    );
  }

  // Filter eligible students in assignment modal
  const eligibleStudents = state.students.filter((s) => {
    const isAlreadyAssigned = participants.some((p) => p.student_id === s.id);
    if (isAlreadyAssigned) return false;

    const matchesSearch =
      s.full_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesClass = !filterClass || s.class_id === filterClass;
    const matchesDiv = !filterDivision || s.division_id === filterDivision;
    const matchesGender = !filterGender || s.gender === filterGender;
    const matchesGroup = !filterGroup || s.group_id === filterGroup;

    return matchesSearch && matchesClass && matchesDiv && matchesGender && matchesGroup;
  });

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;

    let startNum = participants.length > 0 ? Math.max(...participants.map((p) => p.participant_number)) + 1 : 101;

    const newParticipants: ProgramParticipant[] = [];

    for (const stuId of selectedStudentIds) {
      const student = state.students.find((s) => s.id === stuId);
      if (!student) continue;

      newParticipants.push({
        id: `part-${Date.now()}-${startNum}`,
        program_id: programId,
        student_id: student.id,
        student_name: student.full_name,
        student_code: student.student_code,
        group_id: student.group_id,
        group_name: student.group_name,
        group_color: student.group_color,
        participant_number: startNum,
        registration_status: 'CONFIRMED',
        attendance_status: 'PRESENT',
        created_at: new Date().toISOString(),
      });
      startNum++;
    }

    dbStore.setState((prev) => ({
      ...prev,
      participants: [...prev.participants, ...newParticipants],
      programs: prev.programs.map((p) =>
        p.id === programId ? { ...p, participant_count: (p.participant_count || 0) + newParticipants.length } : p
      ),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'BULK_ASSIGN_PARTICIPANTS',
          entity_name: 'program',
          entity_id: programId,
          new_values: { count: newParticipants.length },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setSelectedStudentIds([]);
    setIsAddModalOpen(false);
  };

  const handleMarkChange = (participantId: string, val: string) => {
    const num = parseFloat(val) || 0;
    const clamped = Math.min(100, Math.max(0, num));
    setDirectMarks((prev) => ({ ...prev, [participantId]: clamped }));
    setScoreFeedback(null);
  };

  const handleSaveAndComputeResults = () => {
    if (participants.length === 0) {
      setScoreFeedback('Please assign participants before entering scores.');
      return;
    }

    setIsSavingScores(true);

    const participantRecords = participants.map((p) => ({
      participantId: p.id,
      participantNumber: p.participant_number,
      participantName: p.student_name || 'Participant',
      groupId: p.group_id,
      groupName: p.group_name,
      groupColor: p.group_color,
      totalMarks: directMarks[p.id] !== undefined ? directMarks[p.id] : 0,
    }));

    // Auto-calculate with shared tie positions
    const calculated = calculateProgramResults(
      participantRecords,
      state.positions,
      state.grades,
      'SHARED_POSITION'
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
          action: 'SAVE_DIRECT_SCORES',
          entity_name: 'program',
          entity_id: programId,
          new_values: { count: programResults.length },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setIsSavingScores(false);
    setScoreFeedback('✅ Scores saved! Standings & Positions computed automatically.');
    setActiveTab('results');
  };

  const handlePrintJudgingSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-Only Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-judging-sheet,
          #printable-judging-sheet * {
            visibility: visible;
          }
          #printable-judging-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            padding: 20px;
          }
        }
      `}</style>

      {/* Printable Sheet DOM Container */}
      <div id="printable-judging-sheet" className="hidden print:block text-black bg-white p-6">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">{state.organization.name}</h2>
          <h1 className="text-2xl font-black mt-1">OFFICIAL JUDGING & SCORE SHEET</h1>
          <div className="flex justify-between text-xs mt-3 font-semibold">
            <span>Program: {program.program_code} — {program.name}</span>
            <span>Category: {program.category_name} ({program.division_name})</span>
            <span>Venue: {program.venue}</span>
            <span>Date: {formatDate(program.scheduled_at)}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-xs text-left mb-8">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-2 text-center w-16">CHEST #</th>
              <th className="border border-black p-2">PERFORMER / STUDENT NAME</th>
              <th className="border border-black p-2 text-center w-28">HOUSE TEAM</th>
              <th className="border border-black p-2 text-center w-32">SCORE (OUT OF 100)</th>
              <th className="border border-black p-2">JUDGE REMARKS / COMMENTS</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-black h-12">
                <td className="border border-black p-2 text-center font-bold text-sm">
                  #{p.participant_number}
                </td>
                <td className="border border-black p-2 font-bold">{p.student_name}</td>
                <td className="border border-black p-2 text-center">{p.group_name || '—'}</td>
                <td className="border border-black p-2 text-center font-bold"></td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 pt-6 flex justify-between text-xs font-bold">
          <div>
            <div className="w-48 border-b border-black mb-1"></div>
            <span>Judge Name: _______________________</span>
          </div>
          <div>
            <div className="w-48 border-b border-black mb-1"></div>
            <span>Judge Signature: __________________</span>
          </div>
          <div>
            <div className="w-32 border-b border-black mb-1"></div>
            <span>Date & Time: ______________</span>
          </div>
        </div>
      </div>

      {/* Screen View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs">
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
              {program.category_name} • {program.division_name} ({program.venue})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handlePrintJudgingSheet} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1.5" /> Print Judging Sheet
          </Button>

          <Button onClick={() => setIsAddModalOpen(true)} size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-1.5" /> Assign Participants
          </Button>

          <Link href={`/admin/results/review/${program.id}`}>
            <Button size="sm" variant="warning">
              <Trophy className="w-4 h-4 mr-1.5" /> Review & Announce
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'participants', label: '1. Participants & Chest Numbers', count: participants.length, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'marks', label: '2. Enter Marks (Out of 100)', icon: <Scale className="w-3.5 h-3.5" /> },
          { id: 'results', label: '3. Calculated Ranks & Points', count: results.length, icon: <Trophy className="w-3.5 h-3.5" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Participants List */}
      {activeTab === 'participants' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Assigned Participants Roster</CardTitle>
              <CardDescription>
                Each performer is assigned a unique chest number for judging
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Participants (with Filters)
            </Button>
          </CardHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique Chest #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>House Team</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length > 0 ? (
                participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        #{p.participant_number}
                      </span>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-900 dark:text-white">
                      {p.student_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">{p.student_code}</TableCell>
                    <TableCell>
                      {p.group_name ? (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                          style={{ backgroundColor: p.group_color || '#3b82f6' }}
                        >
                          {p.group_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={p.attendance_status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    No participants assigned yet. Click "Add Participants" to select students using class and house filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 2: Direct 100-Mark Score Sheet */}
      {activeTab === 'marks' && (
        <Card className="p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-bold">Direct Marks Entry (0 - 100)</CardTitle>
              <CardDescription>
                Enter marks out of 100 for each performer. Same marks automatically receive the same position and award points.
              </CardDescription>
            </div>

            <Button onClick={handleSaveAndComputeResults} variant="success" isLoading={isSavingScores}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save & Compute Standings
            </Button>
          </div>

          {scoreFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {scoreFeedback}
            </div>
          )}

          <div className="space-y-3">
            {participants.map((p) => {
              const currentMark = directMarks[p.id] !== undefined ? directMarks[p.id] : '';

              return (
                <div
                  key={p.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                      #{p.participant_number}
                    </span>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {p.student_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {p.group_name || 'Individual'} • Code: {p.student_code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-500">Marks (out of 100):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0 - 100"
                      value={currentMark}
                      onChange={(e) => handleMarkChange(p.id, e.target.value)}
                      className="w-28 h-11 px-3 text-center text-lg font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 3: Calculated Standings & Positions */}
      {activeTab === 'results' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Auto-Computed Ranks & Award Points</span>
              </CardTitle>
              <CardDescription>
                Positions assigned based on 100-mark scores (tied marks share position and points)
              </CardDescription>
            </div>
            <Link href={`/admin/results/review/${program.id}`}>
              <Button size="sm" variant="warning">
                Go to Announcement Console
              </Button>
            </Link>
          </CardHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
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
                    className={res.position_rank === 1 ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}
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
                          #{res.position_rank}
                        </span>
                        <span className="font-bold text-xs">
                          {res.position_name || `${res.position_rank}th Place`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-black text-blue-600">
                      #{res.participant_number}
                    </TableCell>

                    <TableCell className="font-bold">{res.participant_name}</TableCell>
                    <TableCell>{res.group_name || '—'}</TableCell>
                    <TableCell className="font-black text-base">
                      {res.total_marks} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </TableCell>
                    <TableCell>
                      {res.grade_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200">
                          {res.grade_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-black text-base text-emerald-600 dark:text-emerald-400">
                      +{res.points_awarded} pts
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    No results calculated yet. Enter marks in tab 2 to compute standings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Participants Modal with Multi-Filter Selection */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Participants with Multi-Filter"
        description="Filter students by class, division, gender, and house team, then select in bulk."
        maxWidth="2xl"
      >
        <form onSubmit={handleBulkAssign} className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input
              placeholder="Search by student name or code..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="sm:col-span-4"
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              options={state.classes.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="All Classes"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            />
            <Select
              options={[
                { value: 'MALE', label: 'Boys (Male)' },
                { value: 'FEMALE', label: 'Girls (Female)' },
              ]}
              placeholder="All Genders"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            />
            <Select
              options={state.groups.map((g) => ({ value: g.id, label: g.name }))}
              placeholder="All Houses"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          {/* Quick Select All Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Available Students ({eligibleStudents.length})</span>
            <button
              type="button"
              onClick={() => {
                if (selectedStudentIds.length === eligibleStudents.length) {
                  setSelectedStudentIds([]);
                } else {
                  setSelectedStudentIds(eligibleStudents.map((s) => s.id));
                }
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {selectedStudentIds.length === eligibleStudents.length ? 'Deselect All' : 'Select All Filtered'}
            </button>
          </div>

          {/* Filtered Students Roster List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {eligibleStudents.length > 0 ? (
              eligibleStudents.map((stu) => {
                const isChecked = selectedStudentIds.includes(stu.id);
                return (
                  <label
                    key={stu.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds([...selectedStudentIds, stu.id]);
                          } else {
                            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== stu.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{stu.full_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {stu.student_code} • {stu.class_name} • {stu.gender}
                        </p>
                      </div>
                    </div>

                    {stu.group_name && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: stu.group_color || '#3b82f6' }}
                      >
                        {stu.group_name}
                      </span>
                    )}
                  </label>
                );
              })
            ) : (
              <p className="text-center py-6 text-xs text-slate-400 italic">
                No students match current search / filter criteria.
              </p>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">
              {selectedStudentIds.length} Selected
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={selectedStudentIds.length === 0}>
                Assign Selected ({selectedStudentIds.length}) Performers
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
