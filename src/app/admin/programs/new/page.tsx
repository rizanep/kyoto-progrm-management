'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { dbStore } from '@/lib/store/mockDatabase';
import { Program } from '@/lib/types/database';

export default function SimpleNewProgramPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  const [categories, setCategories] = React.useState(dbStore.getState().categories);
  const [divisions, setDivisions] = React.useState(dbStore.getState().programDivisions);
  const [existingPrograms, setExistingPrograms] = React.useState(dbStore.getState().programs);

  const [code, setCode] = React.useState('P001');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [divisionId, setDivisionId] = React.useState('');
  const [programType, setProgramType] = React.useState<'INDIVIDUAL' | 'GROUP' | 'GENERAL'>('INDIVIDUAL');
  const [venue, setVenue] = React.useState('Main Stage');
  const [duration, setDuration] = React.useState('10');
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [maxParticipants, setMaxParticipants] = React.useState('20');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const state = dbStore.getState();
    setCategories(state.categories);
    setDivisions(state.programDivisions);
    setExistingPrograms(state.programs);
    setCode(`P00${state.programs.length + 1}`);
    setCategoryId(state.categories[0]?.id || '');
    setDivisionId(state.programDivisions[0]?.id || '');

    return dbStore.subscribe(() => {
      const updated = dbStore.getState();
      setCategories(updated.categories);
      setDivisions(updated.programDivisions);
      setExistingPrograms(updated.programs);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !categoryId || !divisionId) return;

    setIsSubmitting(true);

    const selectedCat = categories.find((c) => c.id === categoryId);
    const selectedDiv = divisions.find((d) => d.id === divisionId);
    const programId = `prog-${Date.now()}`;

    const newProgram: Program = {
      id: programId,
      organization_id: dbStore.getState().organization.id,
      program_code: code.toUpperCase(),
      name,
      description: description || null,
      category_id: categoryId,
      category_name: selectedCat?.name,
      category_color: selectedCat?.color,
      division_id: divisionId,
      division_name: selectedDiv?.name,
      program_type: programType,
      min_participants: 1,
      max_participants: parseInt(maxParticipants, 10) || 20,
      duration_minutes: parseInt(duration, 10) || 10,
      venue,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      status: 'SCHEDULED',
      result_status: 'NOT_STARTED',
      is_public_visible: true,
      participant_count: 0,
      eligible_classes: selectedDiv?.eligible_class_ids || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Standard Direct 100-Mark evaluation criterion
    const standardCriteria = [
      {
        id: `crit-${Date.now()}`,
        program_id: programId,
        name: 'Total Performance & Evaluation',
        max_marks: 100,
        weight: 1.0,
        sort_order: 1,
      },
    ];

    dbStore.setState((prev) => ({
      ...prev,
      programs: [newProgram, ...prev.programs],
      judgingCriteria: {
        ...prev.judgingCriteria,
        [programId]: standardCriteria,
      },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'CREATE_PROGRAM',
          entity_name: 'program',
          entity_id: programId,
          new_values: { name: newProgram.name, code: newProgram.program_code },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    router.push(`/admin/programs/${programId}`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/programs">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Create New Program</span>
          </h1>
          <p className="text-xs text-slate-500">
            Quickly add a competition event with class-based divisions and direct 100-mark evaluation.
          </p>
        </div>
      </div>

      {/* Simplified 1-Page Form */}
      <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Program Code *"
              placeholder="e.g. P004"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Program Title *"
                placeholder="e.g. Solo Song / 100m Sprint / Quiz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Category, Class-based Division, Program Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category *"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            <Select
              label="Division (Class Level) *"
              options={divisions.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.description || 'Classes'})`,
              }))}
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
            />
            <Select
              label="Participation Type *"
              options={[
                { value: 'INDIVIDUAL', label: 'Solo (Individual)' },
                { value: 'GROUP', label: 'House Group Event' },
                { value: 'GENERAL', label: 'Open General' },
              ]}
              value={programType}
              onChange={(e) => setProgramType(e.target.value as any)}
            />
          </div>

          {/* Row 3: Venue, Duration, Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Venue / Stage"
              placeholder="e.g. Main Auditorium Stage"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Input
              label="Max Performers Limit"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <Input
            label="Short Description / Guidelines"
            placeholder="e.g. Max 5 minutes per performance. Direct evaluation out of 100 marks."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link href="/admin/programs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button type="submit" variant="success" isLoading={isSubmitting}>
              <Check className="w-4 h-4 mr-1.5" /> Save & Open Program
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
