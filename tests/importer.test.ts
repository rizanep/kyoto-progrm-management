import { describe, it, expect } from 'vitest';
import { validateCsvStudentBatch } from '@/features/students/services/studentImportService';
import { AcademicClass, Division } from '@/lib/types/database';

describe('CSV Student Importer', () => {
  const classes: AcademicClass[] = [
    { id: 'c1', organization_id: 'org1', name: 'Class 5', code: 'CLS-05', sort_order: 1, is_active: true },
    { id: 'c2', organization_id: 'org1', name: 'Class 6', code: 'CLS-06', sort_order: 2, is_active: true },
  ];

  const divisions: Division[] = [
    { id: 'd1', organization_id: 'org1', class_id: 'c1', name: 'Division A', code: 'DIV-A', sort_order: 1, is_active: true },
  ];

  it('should validate and parse correct rows', () => {
    const raw = [
      {
        student_code: 'STU-991',
        full_name: 'Mira Nair',
        gender: 'FEMALE',
        class_code: 'CLS-05',
        division_code: 'DIV-A',
      },
    ];

    const result = validateCsvStudentBatch(raw, classes, divisions, new Set());
    expect(result.validRows).toHaveLength(1);
    expect(result.invalidRows).toHaveLength(0);
    expect(result.validRows[0].classId).toBe('c1');
  });

  it('should flag duplicate student codes and non-existent classes', () => {
    const raw = [
      {
        student_code: 'STU-EXISTING',
        full_name: 'Existing Boy',
        gender: 'MALE',
        class_code: 'CLS-99', // invalid
      },
    ];

    const result = validateCsvStudentBatch(raw, classes, divisions, new Set(['STU-EXISTING']));
    expect(result.validRows).toHaveLength(0);
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0].errors).toHaveLength(2);
  });
});
