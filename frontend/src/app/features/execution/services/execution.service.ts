import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ScreeningSession } from '../../../shared/models/session.models';

export type EvaluatedOutcome = 'ACIERTO' | 'ERROR' | 'OMISION' | 'NO_APLICA';

export interface ItemResultData_3_1 {
  stimulusId: string;
  recognizedText: string;
  isCorrect: boolean;
}

export interface ItemResultPayload<TData = any> {
  id?: number;
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  evaluatedOutcome: EvaluatedOutcome;
  data: TData;
  createdAt?: string;
}

export interface SilenceEvent {
  occurredAt: string;
  type: 'FIRST_SILENCE' | 'SECOND_SILENCE';
}

export interface ItemTimingState {
  sessionId: number;
  itemCode: string;
  startedAt: string;
  durationSeconds: number;
  silenceThresholdSeconds: number;
  silenceEvents: SilenceEvent[];
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {
  private readonly sessionsUrl = `${environment.apiBaseUrl}/sessions`;
  private readonly resultsUrl = `${environment.apiBaseUrl}/results`;
  private readonly executionUrl = `${environment.apiBaseUrl}/execution`;

  constructor(private http: HttpClient) {}

  getSession(sessionId: number): Observable<ScreeningSession> {
    return this.http.get<ScreeningSession>(`${this.sessionsUrl}/${sessionId}`);
  }

  startSession(sessionId: number): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(`${this.sessionsUrl}/${sessionId}/start`, {});
  }

  completeSession(sessionId: number): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(`${this.sessionsUrl}/${sessionId}/complete`, {});
  }

  getResultsForSession(sessionId: number): Observable<ItemResultPayload[]> {
    return this.http.get<ItemResultPayload[]>(`${this.resultsUrl}/session/${sessionId}`);
  }

  saveStimulusResult(params: {
    sessionId: number;
    itemCode: string;
    positionInSession: number;
    evaluatedOutcome: EvaluatedOutcome;
    stimulusId?: string;
    data?: any;
  }): Observable<ItemResultPayload> {
    const { sessionId, itemCode, positionInSession, evaluatedOutcome, stimulusId, data } = params;
    return this.http.post<ItemResultPayload>(
      `${this.resultsUrl}/session/${sessionId}`,
      {
        itemCode,
        positionInSession,
        evaluatedOutcome,
        data: data ?? { stimulusId }
      }
    );
  }

  getItemTimingState(sessionId: number, itemCode: string): Observable<ItemTimingState> {
    return this.http.get<ItemTimingState>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/state`
    );
  }

  getSessionTimingStates(sessionId: number): Observable<ItemTimingState[]> {
    return this.http.get<ItemTimingState[]>(`${this.executionUrl}/session/${sessionId}/state`);
  }

  startItemTiming(sessionId: number, itemCode: string): Observable<ItemTimingState> {
    return this.http.post<ItemTimingState>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/start`,
      {}
    );
  }

  registerSilence(sessionId: number, itemCode: string, level: 1 | 2): Observable<ItemTimingState> {
    return this.http.post<ItemTimingState>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/silence`,
      { level }
    );
  }

  completeItemTiming(sessionId: number, itemCode: string): Observable<ItemTimingState> {
    return this.http.post<ItemTimingState>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/complete`,
      {}
    );
  }
}
