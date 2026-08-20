'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  Archive,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { Student } from '@/lib/types/database';
import { exportToCsv } from '@/lib/utils/export';
import { formatDate } from '@/lib/utils/formatters';

export default function StudentsPage() {
  const [students, setStudents] = React.useState(dbStore.getState().students);
  const [classes] = React.useState(dbStore.getState().classes);
  const [divisions] = React.useState(dbStore.getState().divisions);
  const [groups] = React.useState(dbStore.getState().groups);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [classFilter, setClassFilter] = React.useState('');
  const [groupFilter, setGroupFilter] = React.useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Form Fields
  const [studentCode, setStudentCode] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [regNumber, setRegNumber] = React.useState('');
  const [gender, setGender] = React.useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dob, setDob] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedDivision, setSelectedDivision] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState('');

  React.useEffect(() => {
    import('@/lib/supabase/db').then(({ api }) => {
      api.getStudents().then((res) => {
        if (res) setStudents(res);
      });
    });
    return dbStore.subscribe(() => {
      setStudents(dbStore.getState().students);
    });
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.registration_number && s.registration_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = !classFilter || s.class_id === classFilter;
    const matchesGroup = !groupFilter || s.group_id === groupFilter;

    return matchesSearch && matchesClass && matchesGroup;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode || !fullName || !selectedClass) return;

    const cls = classes.find((c) => c.id === selectedClass);
    const div = divisions.find((d) => d.id === selectedDivision);
    const grp = groups.find((g) => g.id === selectedGroup);

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      organization_id: dbStore.getState().organization.id,
      student_code: studentCode.toUpperCase(),
      registration_number: regNumber || `REG-${Date.now().toString().slice(-4)}`,
      full_name: fullName,
      gender,
      date_of_birth: dob || null,
      class_id: selectedClass,
      class_name: cls?.name,
      division_id: selectedDivision || null,
      division_name: div?.name,
      group_id: selectedGroup || null,
      group_name: grp?.name,
      group_color: grp?.color,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    dbStore.setState((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'CREATE_STUDENT',
          entity_name: 'student',
          entity_id: newStudent.id,
          new_values: { name: newStudent.full_name, code: newStudent.student_code },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    import('@/lib/supabase/db').then(({ api }) => {
      api.createStudent(newStudent);
    });

    setIsCreateModalOpen(false);
    // Reset Form
    setStudentCode('');
    setFullName('');
    setRegNumber('');
    setDob('');
  };

  const handleDeleteStudent = (id: string) => {
    import('@/lib/supabase/db').then(({ api }) => {
      api.deleteStudent(id);
    });
  };

  const handleExportCsv = () => {
    const exportData = filteredStudents.map((s) => ({
      'Student Code': s.student_code,
      'Registration No': s.registration_number || '',
      'Full Name': s.full_name,
      Gender: s.gender,
      'Date of Birth': s.date_of_birth || '',
      Class: s.class_name || '',
      Division: s.division_name || '',
      'House Group': s.group_name || '',
      Status: s.status,
    }));
    exportToCsv(exportData, 'students_roster');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Student Directory & Enrollment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, academic grading, and house affiliations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleExportCsv} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Link href="/admin/students/import">
            <Button variant="secondary" size="sm">
              <Upload className="w-4 h-4 mr-1.5" /> Import CSV
            </Button>
          </Link>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, student code, or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All Classes"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
          <Select
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            placeholder="All Houses / Groups"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Students Data Table */}
      <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Code / Reg</TableHead>
              <TableHead>Academic Class</TableHead>
              <TableHead>House Team</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((stu) => (
                <TableRow key={stu.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={stu.photo_url}
                        alt={stu.full_name}
                        fallbackText={stu.full_name}
                        size="sm"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{stu.full_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{stu.gender.toLowerCase()}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {stu.student_code}
                    </span>
                    {stu.registration_number && (
                      <p className="text-[11px] text-slate-400">{stu.registration_number}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      {stu.class_name || '—'} {stu.division_name ? `(${stu.division_name})` : ''}
                    </span>
                  </TableCell>

                  <TableCell>
                    {stu.group_name ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                        style={{ backgroundColor: stu.group_color || '#3b82f6' }}
                      >
                        <Shield className="w-3 h-3" />
                        {stu.group_name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {formatDate(stu.date_of_birth)}
                  </TableCell>

                  <TableCell>
                    <StatusPill status={stu.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  No students found matching current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Student"
        description="Add a student record to the organization roster."
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Student Code *"
              placeholder="e.g. STU-005"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. REG-2026-005"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
            />
          </div>

          <Input
            label="Full Name *"
            placeholder="e.g. Kabir Mehta"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Gender *"
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              value={gender}
              onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
            />
            <Input
              type="date"
              label="Date of Birth"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Academic Class *"
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            />
            <Select
              label="Division"
              options={divisions
                .filter((d) => !selectedClass || d.class_id === selectedClass)
                .map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Select Division"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            />
          </div>

          <Select
            label="House Team / Group"
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            placeholder="Assign House Team (Optional)"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
