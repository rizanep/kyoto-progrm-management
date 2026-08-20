'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Play,
  ClipboardCheck,
  Scale,
  Trophy,
  ChevronRight,
  Eye,
  MoreVertical,
  Radio,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime, formatDate } from '@/lib/utils/formatters';

export default function ProgramsListPage() {
  const [programs, setPrograms] = React.useState(dbStore.getState().programs);
  const [categories] = React.useState(dbStore.getState().categories);
  const [divisions] = React.useState(dbStore.getState().programDivisions);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setPrograms(dbStore.getState().programs);
    });
  }, []);

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.program_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !categoryFilter || p.category_id === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleStartProgram = (programId: string, programName: string) => {
    dbStore.setState((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId
          ? {
              ...p,
              status: 'STARTED',
              started_at: new Date().toISOString(),
              result_status: 'IN_PROGRESS',
            }
          : p
      ),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'START_PROGRAM',
          entity_name: 'program',
          entity_id: programId,
          new_values: { status: 'STARTED', name: programName },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Competition Programs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage stage and athletic events, participant registration, judging workflows, and announcements.
          </p>
        </div>

        <Link href="/admin/programs/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Create Program
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by program name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All Categories"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'STARTED', label: 'Started / In Progress' },
              { value: 'JUDGING', label: 'Judging' },
              { value: 'JUDGED', label: 'Judged' },
              { value: 'ANNOUNCED', label: 'Announced' },
            ]}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Programs List */}
      <div className="space-y-3.5">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => (
            <Card
              key={prog.id}
              className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              hoverEffect
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-slate-800 dark:text-slate-200 rounded-lg">
                    {prog.program_code}
                  </span>
                  <Link
                    href={`/admin/programs/${prog.id}`}
                    className="text-base font-extrabold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {prog.name}
                  </Link>
                  <StatusPill status={prog.status} />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {prog.program_type}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                  {prog.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: prog.category_color || '#6366f1' }} />
                    {prog.category_name} • {prog.division_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(prog.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {formatTime(prog.scheduled_at)} ({prog.duration_minutes}m)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {prog.venue || 'TBD'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {prog.participant_count || 0} Participants
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {prog.status === 'SCHEDULED' && (
                  <Button
                    onClick={() => handleStartProgram(prog.id, prog.name)}
                    size="sm"
                    variant="success"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Start Event
                  </Button>
                )}

                {prog.status === 'STARTED' && (
                  <Link href={`/admin/judging/${prog.id}`}>
                    <Button size="sm" variant="primary">
                      <Scale className="w-3.5 h-3.5 mr-1" /> Enter Scores
                    </Button>
                  </Link>
                )}

                {prog.status === 'JUDGED' && (
                  <Link href={`/admin/results/review/${prog.id}`}>
                    <Button size="sm" variant="warning">
                      <Trophy className="w-3.5 h-3.5 mr-1" /> Review & Announce
                    </Button>
                  </Link>
                )}

                {prog.status === 'ANNOUNCED' && (
                  <Link href={`/admin/results/review/${prog.id}`}>
                    <Button size="sm" variant="outline">
                      <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" /> Results
                    </Button>
                  </Link>
                )}

                <Link href={`/admin/programs/${prog.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-slate-400 rounded-3xl">
            No competition programs found matching current filters.
          </Card>
        )}
      </div>
    </div>
  );
}
