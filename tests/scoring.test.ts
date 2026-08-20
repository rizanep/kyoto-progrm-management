import { describe, it, expect } from 'vitest';
import { aggregateMultiJudgeScores } from '@/features/judging/services/multiJudgeEngine';
import { calculateProgramResults } from '@/features/results/services/resultCalculationEngine';
import { Position, Grade } from '@/lib/types/database';

describe('Scoring & Multi-Judge Engine', () => {
  it('should calculate SUM correctly across multiple judges', () => {
    const scores = [
      { judgeId: 'j1', criterionScores: [{ criterionId: 'c1', marks: 35 }, { criterionId: 'c2', marks: 45 }] },
      { judgeId: 'j2', criterionScores: [{ criterionId: 'c1', marks: 40 }, { criterionId: 'c2', marks: 40 }] },
    ];
    const total = aggregateMultiJudgeScores(scores, 'SUM');
    expect(total).toBe(160);
  });

  it('should calculate AVERAGE correctly across multiple judges', () => {
    const scores = [
      { judgeId: 'j1', criterionScores: [{ criterionId: 'c1', marks: 80 }] },
      { judgeId: 'j2', criterionScores: [{ criterionId: 'c1', marks: 90 }] },
    ];
    const avg = aggregateMultiJudgeScores(scores, 'AVERAGE');
    expect(avg).toBe(85);
  });

  it('should perform OLYMPIC_TRIMMED correctly dropping highest and lowest', () => {
    const scores = [
      { judgeId: 'j1', criterionScores: [{ criterionId: 'c1', marks: 60 }] }, // min (dropped)
      { judgeId: 'j2', criterionScores: [{ criterionId: 'c1', marks: 80 }] }, // kept
      { judgeId: 'j3', criterionScores: [{ criterionId: 'c1', marks: 85 }] }, // kept
      { judgeId: 'j4', criterionScores: [{ criterionId: 'c1', marks: 95 }] }, // max (dropped)
    ];
    // Trimmed: 80 and 85 -> average = 82.5
    const result = aggregateMultiJudgeScores(scores, 'OLYMPIC_TRIMMED');
    expect(result).toBe(82.5);
  });
});

describe('Result Calculation & Positions/Grades Engine', () => {
  const positions: Position[] = [
    { id: 'pos1', scoring_config_id: 'cfg1', name: '1st Place', code: '1ST', rank: 1, points: 5, color: '#eab308', sort_order: 1, is_active: true },
    { id: 'pos2', scoring_config_id: 'cfg1', name: '2nd Place', code: '2ND', rank: 2, points: 3, color: '#94a3b8', sort_order: 2, is_active: true },
    { id: 'pos3', scoring_config_id: 'cfg1', name: '3rd Place', code: '3RD', rank: 3, points: 1, color: '#b45309', sort_order: 3, is_active: true },
  ];

  const grades: Grade[] = [
    { id: 'grdA', scoring_config_id: 'cfg1', name: 'Grade A', min_mark: 80, max_mark: 100, points: 5, sort_order: 1 },
    { id: 'grdB', scoring_config_id: 'cfg1', name: 'Grade B', min_mark: 60, max_mark: 79.99, points: 3, sort_order: 2 },
  ];

  it('should assign ranks and calculate points appropriately', () => {
    const participants = [
      { participantId: 'p1', participantNumber: 101, participantName: 'Student Alpha', totalMarks: 92 },
      { participantId: 'p2', participantNumber: 102, participantName: 'Student Beta', totalMarks: 75 },
    ];

    const results = calculateProgramResults(participants, positions, grades);
    expect(results[0].positionRank).toBe(1);
    expect(results[0].positionName).toBe('1st Place');
    expect(results[0].gradeName).toBe('Grade A');
    // Position 5 pts + Grade A 5 pts = 10 pts
    expect(results[0].pointsAwarded).toBe(10);

    expect(results[1].positionRank).toBe(2);
    expect(results[1].positionName).toBe('2nd Place');
    expect(results[1].gradeName).toBe('Grade B');
    // Position 3 pts + Grade B 3 pts = 6 pts
    expect(results[1].pointsAwarded).toBe(6);
  });

  it('should assign the SAME position to students with the SAME marks', () => {
    const tiedParticipants = [
      { participantId: 'p1', participantNumber: 101, participantName: 'Student Alpha', totalMarks: 95 },
      { participantId: 'p2', participantNumber: 102, participantName: 'Student Beta', totalMarks: 95 }, // TIED for 1st
      { participantId: 'p3', participantNumber: 103, participantName: 'Student Gamma', totalMarks: 80 },
    ];

    const results = calculateProgramResults(tiedParticipants, positions, grades);
    // Both p1 and p2 should have Rank 1 and 1st Place points (5 + 5 = 10)
    expect(results[0].positionRank).toBe(1);
    expect(results[0].positionName).toBe('1st Place');
    expect(results[0].pointsAwarded).toBe(10);

    expect(results[1].positionRank).toBe(1);
    expect(results[1].positionName).toBe('1st Place');
    expect(results[1].pointsAwarded).toBe(10);

    // p3 receives 2nd position
    expect(results[2].positionRank).toBe(2);
    expect(results[2].positionName).toBe('2nd Place');
  });
});
