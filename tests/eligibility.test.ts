import { describe, it, expect } from 'vitest';
import { validateStudentEligibility } from '@/features/programs/services/eligibilityEngine';
import { Student, Program, ProgramDivision } from '@/lib/types/database';

describe('Eligibility Engine', () => {
  const mockStudent: Student = {
    id: 's1',
    organization_id: 'org1',
    student_code: 'STU-001',
    full_name: 'Aarav Sharma',
    date_of_birth: '2014-04-12',
    gender: 'MALE',
    class_id: 'cls-5',
    class_name: 'Class 5',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  const mockProgram: Program = {
    id: 'p1',
    organization_id: 'org1',
    program_code: 'P001',
    name: 'Junior Classical Dance',
    category_id: 'cat1',
    division_id: 'div-jun',
    program_type: 'INDIVIDUAL',
    min_participants: 1,
    max_participants: 10,
    duration_minutes: 10,
    status: 'SCHEDULED',
    result_status: 'NOT_STARTED',
    is_public_visible: true,
    eligible_classes: ['cls-5', 'cls-6'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockDivision: ProgramDivision = {
    id: 'div-jun',
    organization_id: 'org1',
    name: 'Junior',
    code: 'DIV-JUN',
    min_age: 10,
    max_age: 13,
    sort_order: 1,
    is_active: true,
  };

  it('should approve an eligible active student in allowed class and age', () => {
    const result = validateStudentEligibility(mockStudent, mockProgram, mockDivision, 3);
    expect(result.isEligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('should reject a student if program capacity is reached', () => {
    const result = validateStudentEligibility(mockStudent, mockProgram, mockDivision, 10);
    expect(result.isEligible).toBe(false);
    expect(result.reasons[0]).toContain('capacity reached');
  });

  it('should reject a student not belonging to an eligible class', () => {
    const nonEligibleStudent: Student = {
      ...mockStudent,
      class_id: 'cls-8',
      class_name: 'Class 8',
    };
    const result = validateStudentEligibility(nonEligibleStudent, mockProgram, mockDivision, 0);
    expect(result.isEligible).toBe(false);
    expect(result.reasons[0]).toContain('not permitted');
  });

  it('should reject a student with SUSPENDED status', () => {
    const suspendedStudent: Student = {
      ...mockStudent,
      status: 'SUSPENDED',
    };
    const result = validateStudentEligibility(suspendedStudent, mockProgram, mockDivision, 0);
    expect(result.isEligible).toBe(false);
    expect(result.reasons[0]).toContain('SUSPENDED');
  });
});
