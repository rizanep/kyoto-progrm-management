import { Position, Grade } from '@/lib/types/database';

export interface ParticipantScoreRecord {
  participantId: string;
  participantNumber: number;
  participantName: string;
  groupId?: string | null;
  groupName?: string | null;
  groupColor?: string | null;
  totalMarks: number; // 0 to 100
}

export interface CalculatedResultItem {
  participantId: string;
  participantNumber: number;
  participantName: string;
  groupId?: string | null;
  groupName?: string | null;
  groupColor?: string | null;
  totalMarks: number;
  positionId?: string | null;
  positionName?: string | null;
  positionRank?: number | null;
  gradeId?: string | null;
  gradeName?: string | null;
  pointsAwarded: number;
}

export function matchGradeForScore(marks: number, grades: Grade[]): Grade | undefined {
  return grades.find((g) => marks >= g.min_mark && marks <= g.max_mark);
}

export function calculateProgramResults(
  participants: ParticipantScoreRecord[],
  positions: Position[],
  grades: Grade[],
  tieBreakingRule: 'SHARED_POSITION' | 'CRITERION_PRIORITY' = 'SHARED_POSITION'
): CalculatedResultItem[] {
  // 1. Sort participants by total marks descending (highest mark first)
  const sorted = [...participants].sort((a, b) => b.totalMarks - a.totalMarks);

  // 2. Sort available positions by rank (1st, 2nd, 3rd...)
  const sortedPositions = [...positions].sort((a, b) => a.rank - b.rank);

  const results: CalculatedResultItem[] = [];

  let rankCounter = 1;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    // Clamp marks between 0 and 100
    const clampedMarks = Math.min(100, Math.max(0, Number(item.totalMarks) || 0));

    const matchingGrade = matchGradeForScore(clampedMarks, grades);

    // If same mark as previous student, share the EXACT same position and rank!
    let assignedRank = rankCounter;
    let assignedPosition: Position | undefined;

    if (i > 0 && clampedMarks === sorted[i - 1].totalMarks) {
      // Same marks = Same position as previous
      const prevResult = results[i - 1];
      assignedRank = prevResult.positionRank || rankCounter;
      assignedPosition = sortedPositions.find((p) => p.rank === assignedRank);
    } else {
      assignedRank = rankCounter;
      assignedPosition = sortedPositions.find((p) => p.rank === assignedRank);
      rankCounter++;
    }

    const positionPoints = assignedPosition ? Number(assignedPosition.points) : 0;
    const gradePoints = matchingGrade ? Number(matchingGrade.points) : 0;
    const totalPoints = positionPoints + gradePoints;

    results.push({
      participantId: item.participantId,
      participantNumber: item.participantNumber,
      participantName: item.participantName,
      groupId: item.groupId,
      groupName: item.groupName,
      groupColor: item.groupColor,
      totalMarks: clampedMarks,
      positionId: assignedPosition?.id || null,
      positionName: assignedPosition?.name || (assignedRank <= sortedPositions.length ? `${assignedRank}th Place` : null),
      positionRank: assignedRank,
      gradeId: matchingGrade?.id || null,
      gradeName: matchingGrade?.name || null,
      pointsAwarded: totalPoints,
    });
  }

  return results;
}
