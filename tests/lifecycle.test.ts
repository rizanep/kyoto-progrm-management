import { describe, it, expect } from 'vitest';
import { validateStudentEligibility } from '@/features/programs/services/eligibilityEngine';
import { calculateProgramResults } from '@/features/results/services/resultCalculationEngine';
import { aggregateMultiJudgeScores } from '@/features/judging/services/multiJudgeEngine';
import { canTransitionProgramStatus } from '@/features/programs/services/stateMachine';
import { Position, Grade, Student, Program, ProgramDivision } from '@/lib/types/database';

describe('End-to-End Competition Scenario (Section 115 Acceptance Spec)', () => {
  // 1. Setup Data
  const juniorDivision: ProgramDivision = {
    id: 'div-jun',
    organization_id: 'org-1',
    name: 'Junior',
    code: 'DIV-JUN',
    min_age: 10,
    max_age: 13,
    sort_order: 1,
    is_active: true,
  };

  const danceProgram: Program = {
    id: 'prog-dance',
    organization_id: 'org-1',
    program_code: 'P001',
    name: 'Junior Classical Dance',
    category_id: 'cat-stage',
    division_id: 'div-jun',
    program_type: 'INDIVIDUAL',
    min_participants: 1,
    max_participants: 10,
    duration_minutes: 8,
    status: 'SCHEDULED',
    result_status: 'NOT_STARTED',
    is_public_visible: true,
    eligible_classes: ['cls-5', 'cls-6', 'cls-7'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const studentAarav: Student = {
    id: 'stu-aarav',
    organization_id: 'org-1',
    student_code: 'STU-001',
    full_name: 'Aarav Sharma',
    date_of_birth: '2014-04-12', // ~12 yrs old (eligible for Junior)
    gender: 'MALE',
    class_id: 'cls-5',
    class_name: 'Class 5',
    group_id: 'grp-red',
    group_name: 'Red Phoenix',
    group_color: '#ef4444',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  const studentAnanya: Student = {
    id: 'stu-ananya',
    organization_id: 'org-1',
    student_code: 'STU-002',
    full_name: 'Ananya Iyer',
    date_of_birth: '2014-07-25', // ~12 yrs old
    gender: 'FEMALE',
    class_id: 'cls-5',
    class_name: 'Class 5',
    group_id: 'grp-blue',
    group_name: 'Blue Dragons',
    group_color: '#3b82f6',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  const positions: Position[] = [
    { id: 'pos-1', scoring_config_id: 'cfg-1', name: '1st Place', code: '1ST', rank: 1, points: 5, color: '#eab308', sort_order: 1, is_active: true },
    { id: 'pos-2', scoring_config_id: 'cfg-1', name: '2nd Place', code: '2ND', rank: 2, points: 3, color: '#94a3b8', sort_order: 2, is_active: true },
    { id: 'pos-3', scoring_config_id: 'cfg-1', name: '3rd Place', code: '3RD', rank: 3, points: 1, color: '#b45309', sort_order: 3, is_active: true },
  ];

  const grades: Grade[] = [
    { id: 'grd-a', scoring_config_id: 'cfg-1', name: 'Grade A', min_mark: 80, max_mark: 100, points: 5, sort_order: 1 },
    { id: 'grd-b', scoring_config_id: 'cfg-1', name: 'Grade B', min_mark: 60, max_mark: 79.99, points: 3, sort_order: 2 },
  ];

  it('Step 1: Validates student eligibility for program', () => {
    const elAarav = validateStudentEligibility(studentAarav, danceProgram, juniorDivision, 0);
    expect(elAarav.isEligible).toBe(true);

    const elAnanya = validateStudentEligibility(studentAnanya, danceProgram, juniorDivision, 1);
    expect(elAnanya.isEligible).toBe(true);
  });

  it('Step 2: Start program and transition through state machine', () => {
    expect(canTransitionProgramStatus('SCHEDULED', 'STARTED')).toBe(true);
    expect(canTransitionProgramStatus('STARTED', 'JUDGING')).toBe(true);
    expect(canTransitionProgramStatus('JUDGING', 'JUDGED')).toBe(true);
    expect(canTransitionProgramStatus('JUDGED', 'ANNOUNCED')).toBe(true);
  });

  it('Step 3: Multi-Judge Scoring and Position/Grade Calculation', () => {
    // Judge 1 & 2 scores for Aarav (Total = 92)
    const aaravJudgeScores = [
      { judgeId: 'j1', criterionScores: [{ criterionId: 'c1', marks: 38 }, { criterionId: 'c2', marks: 28 }, { criterionId: 'c3', marks: 18 }, { criterionId: 'c4', marks: 8 }] }, // sum = 92
    ];
    const aaravTotal = aggregateMultiJudgeScores(aaravJudgeScores, 'SUM');
    expect(aaravTotal).toBe(92);

    // Judge scores for Ananya (Total = 84)
    const ananyaJudgeScores = [
      { judgeId: 'j1', criterionScores: [{ criterionId: 'c1', marks: 34 }, { criterionId: 'c2', marks: 26 }, { criterionId: 'c3', marks: 16 }, { criterionId: 'c4', marks: 8 }] }, // sum = 84
    ];
    const ananyaTotal = aggregateMultiJudgeScores(ananyaJudgeScores, 'SUM');
    expect(ananyaTotal).toBe(84);

    // Calculate official results
    const results = calculateProgramResults(
      [
        { participantId: 'p-aarav', participantNumber: 101, participantName: 'Aarav Sharma', groupId: 'grp-red', groupName: 'Red Phoenix', totalMarks: aaravTotal },
        { participantId: 'p-ananya', participantNumber: 102, participantName: 'Ananya Iyer', groupId: 'grp-blue', groupName: 'Blue Dragons', totalMarks: ananyaTotal },
      ],
      positions,
      grades
    );

    // 1st Place: Aarav (Position 5 + Grade A 5 = 10 pts)
    expect(results[0].participantName).toBe('Aarav Sharma');
    expect(results[0].positionRank).toBe(1);
    expect(results[0].positionName).toBe('1st Place');
    expect(results[0].gradeName).toBe('Grade A');
    expect(results[0].pointsAwarded).toBe(10);

    // 2nd Place: Ananya (Position 3 + Grade A 5 = 8 pts)
    expect(results[1].participantName).toBe('Ananya Iyer');
    expect(results[1].positionRank).toBe(2);
    expect(results[1].positionName).toBe('2nd Place');
    expect(results[1].gradeName).toBe('Grade A');
    expect(results[1].pointsAwarded).toBe(8);
  });
});
