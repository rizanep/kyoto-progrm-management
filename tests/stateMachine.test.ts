import { describe, it, expect } from 'vitest';
import {
  canTransitionProgramStatus,
  validateProgramAnnouncementEligibility,
} from '@/features/programs/services/stateMachine';

describe('Program State Machine', () => {
  it('should allow valid linear progression', () => {
    expect(canTransitionProgramStatus('DRAFT', 'SCHEDULED')).toBe(true);
    expect(canTransitionProgramStatus('SCHEDULED', 'STARTED')).toBe(true);
    expect(canTransitionProgramStatus('STARTED', 'JUDGING')).toBe(true);
    expect(canTransitionProgramStatus('JUDGING', 'JUDGED')).toBe(true);
    expect(canTransitionProgramStatus('JUDGED', 'ANNOUNCED')).toBe(true);
  });

  it('should reject invalid reverse or jumping transitions', () => {
    expect(canTransitionProgramStatus('ANNOUNCED', 'DRAFT')).toBe(false);
    expect(canTransitionProgramStatus('DRAFT', 'JUDGED')).toBe(false);
    expect(canTransitionProgramStatus('STARTED', 'ANNOUNCED')).toBe(false);
  });

  it('should validate announcement requirements', () => {
    // Fails when unscored present participants exist
    const invalidCheck = validateProgramAnnouncementEligibility({
      status: 'JUDGED',
      participantCount: 5,
      unscoredCount: 2,
      absentCount: 0,
    });
    expect(invalidCheck.canAnnounce).toBe(false);
    expect(invalidCheck.error).toContain('recorded judge scores');

    // Passes when everything is scored
    const validCheck = validateProgramAnnouncementEligibility({
      status: 'JUDGED',
      participantCount: 5,
      unscoredCount: 0,
      absentCount: 0,
    });
    expect(validCheck.canAnnounce).toBe(true);
  });
});
