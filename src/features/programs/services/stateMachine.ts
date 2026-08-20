import { ProgramStatus } from '@/lib/types/database';

export const ALLOWED_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
  DRAFT: ['SCHEDULED', 'REGISTRATION_OPEN', 'CANCELLED'],
  SCHEDULED: ['REGISTRATION_OPEN', 'READY', 'STARTED', 'CANCELLED', 'DRAFT'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'READY', 'SCHEDULED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['READY', 'STARTED', 'REGISTRATION_OPEN', 'CANCELLED'],
  READY: ['STARTED', 'SCHEDULED', 'CANCELLED'],
  STARTED: ['ATTENDANCE', 'JUDGING', 'CANCELLED'],
  ATTENDANCE: ['JUDGING', 'STARTED', 'CANCELLED'],
  JUDGING: ['JUDGED', 'ATTENDANCE', 'CANCELLED'],
  JUDGED: ['ANNOUNCED', 'JUDGING', 'CANCELLED'],
  ANNOUNCED: ['COMPLETED', 'JUDGED'], // ANNOUNCED can revert to JUDGED only under privileged correction workflow
  COMPLETED: [],
  CANCELLED: ['DRAFT', 'SCHEDULED'],
};

export function canTransitionProgramStatus(
  currentStatus: ProgramStatus,
  targetStatus: ProgramStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export function validateProgramAnnouncementEligibility(params: {
  status: ProgramStatus;
  participantCount: number;
  unscoredCount: number;
  absentCount: number;
}): { canAnnounce: boolean; error?: string } {
  if (params.status !== 'JUDGED' && params.status !== 'JUDGING') {
    return {
      canAnnounce: false,
      error: `Program must be in 'JUDGED' status before announcement. Currently: '${params.status}'.`,
    };
  }

  if (params.participantCount === 0) {
    return {
      canAnnounce: false,
      error: 'Cannot announce results for a program with no registered participants.',
    };
  }

  if (params.unscoredCount > 0) {
    return {
      canAnnounce: false,
      error: `Cannot announce results: ${params.unscoredCount} present participant(s) do not have recorded judge scores.`,
    };
  }

  return { canAnnounce: true };
}
