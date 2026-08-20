import { Student, Program, ProgramDivision } from '@/lib/types/database';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function validateStudentEligibility(
  student: Student,
  program: Program,
  programDivision?: ProgramDivision,
  existingParticipantCount = 0
): EligibilityResult {
  const reasons: string[] = [];

  // 1. Program Capacity Check
  if (program.max_participants && existingParticipantCount >= program.max_participants) {
    reasons.push(`Program capacity reached (Max: ${program.max_participants} participants).`);
  }

  // 2. Class Eligibility Check (either directly on program or from division's allowed classes)
  const allowedClasses = program.eligible_classes && program.eligible_classes.length > 0
    ? program.eligible_classes
    : programDivision?.eligible_class_ids;

  if (allowedClasses && allowedClasses.length > 0) {
    if (!student.class_id || !allowedClasses.includes(student.class_id)) {
      reasons.push(
        `Student's class (${student.class_name || 'Unassigned'}) is not permitted for ${programDivision?.name || 'this program'}.`
      );
    }
  }

  // 3. Student Status Check
  if (student.status !== 'ACTIVE') {
    reasons.push(`Student status is '${student.status}'. Only ACTIVE students can participate.`);
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
