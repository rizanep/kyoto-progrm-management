'use client';

import * as React from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Layers,
  FolderTree,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { dbStore } from '@/lib/store/mockDatabase';
import { AcademicClass, Division } from '@/lib/types/database';

export default function AcademicClassesPage() {
  const [classes, setClasses] = React.useState(dbStore.getState().classes);
  const [divisions, setDivisions] = React.useState(dbStore.getState().divisions);

  const [isClassModalOpen, setIsClassModalOpen] = React.useState(false);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = React.useState(false);
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

  // Form states
  const [classNameInput, setClassNameInput] = React.useState('');
  const [classCodeInput, setClassCodeInput] = React.useState('');
  const [divNameInput, setDivNameInput] = React.useState('');
  const [divCodeInput, setDivCodeInput] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setClasses(dbStore.getState().classes);
      setDivisions(dbStore.getState().divisions);
    });
  }, []);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput || !classCodeInput) return;

    const newClass: AcademicClass = {
      id: `cls-${Date.now()}`,
      organization_id: dbStore.getState().organization.id,
      name: classNameInput,
      code: classCodeInput.toUpperCase(),
      sort_order: classes.length + 1,
      is_active: true,
      student_count: 0,
    };

    dbStore.setState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'CREATE_CLASS',
          entity_name: 'academic_class',
          entity_id: newClass.id,
          new_values: { name: newClass.name, code: newClass.code },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setClassNameInput('');
    setClassCodeInput('');
    setIsClassModalOpen(false);
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !divNameInput || !divCodeInput) return;

    const newDiv: Division = {
      id: `div-${Date.now()}`,
      organization_id: dbStore.getState().organization.id,
      class_id: selectedClassId,
      name: divNameInput,
      code: divCodeInput.toUpperCase(),
      sort_order: divisions.filter((d) => d.class_id === selectedClassId).length + 1,
      is_active: true,
    };

    dbStore.setState((prev) => ({
      ...prev,
      divisions: [...prev.divisions, newDiv],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'CREATE_DIVISION',
          entity_name: 'division',
          entity_id: newDiv.id,
          new_values: { name: newDiv.name, code: newDiv.code, class_id: selectedClassId },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setDivNameInput('');
    setDivCodeInput('');
    setIsDivisionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span>Academic Classes & Sections</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic institutional grades, divisions, and student enrollment structure.
          </p>
        </div>

        <Button onClick={() => setIsClassModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Academic Class
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classDivisions = divisions.filter((d) => d.class_id === cls.id);
          const studentCount = dbStore.getState().students.filter((s) => s.class_id === cls.id).length;

          return (
            <Card key={cls.id} className="p-6 rounded-3xl flex flex-col justify-between" hoverEffect>
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400">{cls.code}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                {/* Divisions Section */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Divisions / Sections</span>
                    <button
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setIsDivisionModalOpen(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Section
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {classDivisions.length > 0 ? (
                      classDivisions.map((div) => (
                        <span
                          key={div.id}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                        >
                          {div.name} ({div.code})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No divisions added yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">{studentCount} Students Enrolled</span>
                <span className="text-[11px] text-slate-400">Order: #{cls.sort_order}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Add Academic Class"
        description="Create a new institutional grade or class level."
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <Input
            label="Class Name"
            placeholder="e.g. Class 8 / Grade 8"
            value={classNameInput}
            onChange={(e) => setClassNameInput(e.target.value)}
            required
          />
          <Input
            label="Class Code"
            placeholder="e.g. CLS-08"
            value={classCodeInput}
            onChange={(e) => setClassCodeInput(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Add Division Modal */}
      <Modal
        isOpen={isDivisionModalOpen}
        onClose={() => setIsDivisionModalOpen(false)}
        title="Add Division / Section"
        description="Add a section to the selected academic class."
      >
        <form onSubmit={handleCreateDivision} className="space-y-4">
          <Input
            label="Division Name"
            placeholder="e.g. Division A / Section Alpha"
            value={divNameInput}
            onChange={(e) => setDivNameInput(e.target.value)}
            required
          />
          <Input
            label="Division Code"
            placeholder="e.g. SEC-A"
            value={divCodeInput}
            onChange={(e) => setDivCodeInput(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDivisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Division</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
