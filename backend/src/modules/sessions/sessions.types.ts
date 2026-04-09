export type ScreeningSessionStatus =
  | "BORRADOR"
  | "EN_EJECUCION"
  | "COMPLETADA";

export interface ScreeningSession {
  id: number;
  patientId: number;
  createdByUserId: number;
  status: ScreeningSessionStatus;
  startedAt?: string;
  finishedAt?: string;
}

export interface CreateSessionDto {
  patientId: number;
  createdByUserId: number;
}

export type Session = ScreeningSession;
export type CreateSessionInput = CreateSessionDto;
