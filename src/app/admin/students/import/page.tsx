'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dbStore } from '@/lib/store/mockDatabase';
import {
  validateCsvStudentBatch,
  ImportValidationResult,
} from '@/features/students/services/studentImportService';
import { Student } from '@/lib/types/database';

export default function StudentCsvImportPage() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [validationResult, setValidationResult] = React.useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const classes = dbStore.getState().classes;
  const divisions = dbStore.getState().divisions;
  const existingCodes = new Set(dbStore.getState().students.map((s) => s.student_code));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);

    Papa.parse(uploaded, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as Array<Record<string, string>>;
        const validated = validateCsvStudentBatch(rawData, classes, divisions, existingCodes);
        setValidationResult(validated);
      },
    });
  };

  const handleLoadSample = () => {
    const sampleCsv = `student_code,full_name,gender,date_of_birth,class_code,division_code
STU-010,Siddharth Rao,MALE,2014-03-15,CLS-05,DIV-A
STU-011,Diya Menon,FEMALE,2014-08-20,CLS-05,DIV-B
STU-012,Vikram Rathore,MALE,2013-10-05,CLS-06,DIV-A
STU-013,Meera Joshi,FEMALE,2012-06-11,CLS-07,DIV-A`;

    Papa.parse(sampleCsv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as Array<Record<string, string>>;
        const validated = validateCsvStudentBatch(rawData, classes, divisions, existingCodes);
        setValidationResult(validated);
      },
    });
  };

  const handleCommitImport = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newStudents: Student[] = validationResult.validRows.map((row) => ({
        id: `stu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        organization_id: dbStore.getState().organization.id,
        student_code: row.student_code,
        registration_number: row.registration_number || `REG-${row.student_code}`,
        full_name: row.full_name,
        display_name: row.display_name,
        gender: row.gender,
        date_of_birth: row.date_of_birth || null,
        class_id: row.classId,
        class_name: row.className,
        division_id: row.divisionId,
        division_name: row.divisionName,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      }));

      dbStore.setState((prev) => ({
        ...prev,
        students: [...newStudents, ...prev.students],
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            organization_id: prev.organization.id,
            user_email: prev.profile.email,
            action: 'CSV_IMPORT_STUDENTS',
            entity_name: 'student_batch',
            entity_id: `batch-${Date.now()}`,
            new_values: { count: newStudents.length },
            created_at: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      }));

      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => router.push('/admin/students'), 1200);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/students">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Bulk Student CSV Importer</span>
            </h1>
            <p className="text-xs text-slate-500">
              Validate and bulk enroll students with automated duplicate and class validation.
            </p>
          </div>
        </div>

        <Button onClick={handleLoadSample} variant="ghost" size="sm" className="text-xs text-blue-600">
          Load Sample Dataset
        </Button>
      </div>

      {/* Upload Zone */}
      {!validationResult && (
        <Card className="p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-full text-blue-600 dark:text-blue-400 mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Upload Student Roster CSV
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              File must contain columns: <code className="font-mono text-blue-600">student_code</code>,{' '}
              <code className="font-mono text-blue-600">full_name</code>,{' '}
              <code className="font-mono text-blue-600">gender</code>,{' '}
              <code className="font-mono text-blue-600">class_code</code>
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                Select CSV File
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* Validation Results & Preview */}
      {validationResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Total Parsed</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {validationResult.totalRows}
                </p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-slate-400" />
            </Card>

            <Card className="p-4 rounded-2xl flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase">Valid & Ready</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {validationResult.validRows.length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </Card>

            <Card className="p-4 rounded-2xl flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase">Rejected / Errors</p>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
                  {validationResult.invalidRows.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </Card>
          </div>

          {/* Valid Rows Preview */}
          {validationResult.validRows.length > 0 && (
            <Card className="p-0 rounded-3xl overflow-hidden">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valid Rows Ready for Import ({validationResult.validRows.length})</span>
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Division</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResult.validRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono font-bold">{r.student_code}</TableCell>
                      <TableCell className="font-semibold">{r.full_name}</TableCell>
                      <TableCell>{r.gender}</TableCell>
                      <TableCell>{r.className}</TableCell>
                      <TableCell>{r.divisionName || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Invalid Rows Report */}
          {validationResult.invalidRows.length > 0 && (
            <Card className="p-4 rounded-3xl border-rose-200 dark:border-rose-900 bg-rose-50/20">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Issues Detected ({validationResult.invalidRows.length} Rows)</span>
              </h4>
              <div className="space-y-2">
                {validationResult.invalidRows.map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Row #{inv.rowNumber}: {inv.data.student_code || 'No Code'} -{' '}
                      {inv.data.full_name || 'No Name'}
                    </div>
                    <ul className="list-disc list-inside text-rose-600 dark:text-rose-400 mt-1">
                      {inv.errors.map((e, errIdx) => (
                        <li key={errIdx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setValidationResult(null);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Upload Different CSV
            </Button>

            <Button
              variant="success"
              onClick={handleCommitImport}
              isLoading={isProcessing}
              disabled={validationResult.validRows.length === 0}
            >
              {isSuccess ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Imported Successfully!
                </span>
              ) : (
                `Confirm & Import (${validationResult.validRows.length}) Students`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
