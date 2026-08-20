export type ScoringMethod = 'SUM' | 'AVERAGE' | 'WEIGHTED_AVERAGE' | 'OLYMPIC_TRIMMED';

export interface CriterionScoreInput {
  criterionId: string;
  marks: number;
  weight?: number;
}

export interface JudgeParticipantScore {
  judgeId: string;
  criterionScores: CriterionScoreInput[];
}

export function calculateJudgeTotal(criterionScores: CriterionScoreInput[]): number {
  return criterionScores.reduce((acc, c) => acc + (c.marks * (c.weight ?? 1.0)), 0);
}

export function aggregateMultiJudgeScores(
  judgeScores: JudgeParticipantScore[],
  method: ScoringMethod = 'SUM'
): number {
  if (judgeScores.length === 0) return 0;

  const judgeTotals = judgeScores.map((js) => calculateJudgeTotal(js.criterionScores));

  switch (method) {
    case 'SUM':
      return Number(judgeTotals.reduce((acc, val) => acc + val, 0).toFixed(2));

    case 'AVERAGE':
      const sum = judgeTotals.reduce((acc, val) => acc + val, 0);
      return Number((sum / judgeTotals.length).toFixed(2));

    case 'OLYMPIC_TRIMMED':
      if (judgeTotals.length <= 2) {
        // Fallback to average if 2 or fewer judges
        const simpleSum = judgeTotals.reduce((acc, val) => acc + val, 0);
        return Number((simpleSum / judgeTotals.length).toFixed(2));
      }
      const sorted = [...judgeTotals].sort((a, b) => a - b);
      // Remove lowest (index 0) and highest (last index)
      const trimmed = sorted.slice(1, sorted.length - 1);
      const trimmedSum = trimmed.reduce((acc, val) => acc + val, 0);
      return Number((trimmedSum / trimmed.length).toFixed(2));

    case 'WEIGHTED_AVERAGE':
    default:
      const defaultSum = judgeTotals.reduce((acc, val) => acc + val, 0);
      return Number((defaultSum / judgeTotals.length).toFixed(2));
  }
}
