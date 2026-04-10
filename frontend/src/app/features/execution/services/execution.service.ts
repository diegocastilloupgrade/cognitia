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

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {
  private readonly sessionsUrl = `${environment.apiBaseUrl}/sessions`;
  private readonly resultsUrl = `${environment.apiBaseUrl}/results`;

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
}
