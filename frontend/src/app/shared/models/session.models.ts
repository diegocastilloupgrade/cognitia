export type ScreeningSessionStatus = 'BORRADOR' | 'EN_EJECUCION' | 'COMPLETADA';

export interface ScreeningSession {
  id: number;
  patientId: number;
  createdByUserId: number;
  status: ScreeningSessionStatus;
  startedAt?: string;
  finishedAt?: string;
}
