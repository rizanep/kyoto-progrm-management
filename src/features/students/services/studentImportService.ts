import { z } from 'zod';
import { AcademicClass, Division } from '@/lib/types/database';

export const CsvStudentRowSchema = z.object({
  student_code: z.string().min(1, 'Student code is required'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  registration_number: z.string().optional(),
  display_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  class_code: z.string().min(1, 'Class code is required'),
  division_code: z.string().optional(),
  notes: z.string().optional(),
});

export type CsvStudentRow = z.infer<typeof CsvStudentRowSchema>;

export interface ImportValidationResult {
  validRows: Array<CsvStudentRow & { classId?: string; divisionId?: string; className?: string; divisionName?: string }>;
  invalidRows: Array<{ rowNumber: number; data: Record<string, string>; errors: string[] }>;
  totalRows: number;
}

export function validateCsvStudentBatch(
  rawRows: Array<Record<string, string>>,
  existingClasses: AcademicClass[],
  existingDivisions: Division[],
  existingStudentCodes: Set<string>
): ImportValidationResult {
  const validRows: ImportValidationResult['validRows'] = [];
  const invalidRows: ImportValidationResult['invalidRows'] = [];
  const seenInBatch = new Set<string>();

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 1;
    const cleanData: Record<string, string> = {};
    Object.keys(raw).forEach((k) => {
      cleanData[k.trim().toLowerCase().replace(/\s+/g, '_')] = raw[k]?.trim() || '';
    });

    const parsed = CsvStudentRowSchema.safeParse({
      student_code: cleanData.student_code || cleanData.code || cleanData.admission_number,
      full_name: cleanData.full_name || cleanData.name || cleanData.student_name,
      registration_number: cleanData.registration_number || cleanData.reg_no,
      display_name: cleanData.display_name,
      date_of_birth: cleanData.date_of_birth || cleanData.dob,
      gender: (cleanData.gender || '').toUpperCase(),
      class_code: cleanData.class_code || cleanData.class || cleanData.grade,
      division_code: cleanData.division_code || cleanData.division || cleanData.section,
      notes: cleanData.notes,
    });

    if (!parsed.success) {
      const errMsgs = parsed.error.issues.map((i) => i.message);
      invalidRows.push({ rowNumber: rowNum, data: raw, errors: errMsgs });
      return;
    }

    const row = parsed.data;
    const errors: string[] = [];

    // Duplicate Check
    if (existingStudentCodes.has(row.student_code)) {
      errors.push(`Student code '${row.student_code}' already exists in the system.`);
    }
    if (seenInBatch.has(row.student_code)) {
      errors.push(`Duplicate student code '${row.student_code}' within this CSV file.`);
    }

    // Match Class
    const matchedClass = existingClasses.find(
      (c) => c.code.toLowerCase() === row.class_code.toLowerCase() || c.name.toLowerCase() === row.class_code.toLowerCase()
    );
    if (!matchedClass) {
      errors.push(`Class '${row.class_code}' not found in organization academic records.`);
    }

    // Match Division (Optional)
    let matchedDivision: Division | undefined;
    if (row.division_code && matchedClass) {
      matchedDivision = existingDivisions.find(
        (d) =>
          d.class_id === matchedClass.id &&
          (d.code.toLowerCase() === row.division_code?.toLowerCase() || d.name.toLowerCase() === row.division_code?.toLowerCase())
      );
      if (!matchedDivision) {
        errors.push(`Division '${row.division_code}' not found under ${matchedClass.name}.`);
      }
    }

    if (errors.length > 0) {
      invalidRows.push({ rowNumber: rowNum, data: raw, errors });
    } else {
      seenInBatch.add(row.student_code);
      validRows.push({
        ...row,
        classId: matchedClass?.id,
        className: matchedClass?.name,
        divisionId: matchedDivision?.id,
        divisionName: matchedDivision?.name,
      });
    }
  });

  return {
    validRows,
    invalidRows,
    totalRows: rawRows.length,
  };
}
