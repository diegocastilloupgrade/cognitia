import type { ScreeningSession } from './sessions.types';

export interface SessionValidationResult {
  valid: boolean;
  message?: string;
}

export function validateStartTransition(session: ScreeningSession): SessionValidationResult {
  if (session.status === 'EN_EJECUCION') {
    return { valid: false, message: 'Cannot start session: already in execution' };
  }

  if (session.status !== 'BORRADOR') {
    return { valid: false, message: 'Cannot start session: invalid state transition' };
  }

  if (!session.patientId || session.patientId < 1) {
    return { valid: false, message: 'Cannot start session: no patient assigned' };
  }

  if (session.startedAt || session.finishedAt) {
    return { valid: false, message: 'Cannot re-start session: already executed' };
  }

  return { valid: true };
}

export function validateCompleteTransition(
  session: ScreeningSession,
  resultsCount: number
): SessionValidationResult {
  if (session.status === 'BORRADOR') {
    return { valid: false, message: 'Cannot complete session: session not yet started' };
  }

  if (session.status !== 'EN_EJECUCION') {
    return { valid: false, message: 'Cannot complete session: invalid state transition' };
  }

  if (resultsCount < 1) {
    return { valid: false, message: 'Cannot complete session: no results recorded' };
  }

  return { valid: true };
}
