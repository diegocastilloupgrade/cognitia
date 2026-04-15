import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export { ScreeningSessionStatus, ScreeningSession } from '../../../shared/models/session.models';
import { ScreeningSession } from '../../../shared/models/session.models';

export interface CreateSessionDto {
  patientId: number;
  createdByUserId: number;
}

export interface SessionResultItem {
  id: number;
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  createdAt: string;
  evaluatedOutcome: string;
  data: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/sessions`;
  private readonly resultsBaseUrl = `${environment.apiBaseUrl}/results`;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<ScreeningSession[]> {
    return this.http.get<ScreeningSession[]>(this.baseUrl);
  }

  getSessionById(id: number): Observable<ScreeningSession> {
    return this.http.get<ScreeningSession>(`${this.baseUrl}/${id}`);
  }

  createSession(dto: CreateSessionDto): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(this.baseUrl, dto);
  }

  startSession(id: number): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(`${this.baseUrl}/${id}/start`, {});
  }

  completeSession(id: number): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(`${this.baseUrl}/${id}/complete`, {});
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSessionResults(sessionId: number): Observable<SessionResultItem[]> {
    return this.http.get<SessionResultItem[]>(`${this.resultsBaseUrl}/session/${sessionId}`);
  }

  getOpenSessionByPatientId(patientId: number): Observable<ScreeningSession | null> {
    return this.getSessions().pipe(
      map((sessions) => sessions.find((session) =>
        session.patientId === patientId &&
        (session.status === 'BORRADOR' || session.status === 'EN_EJECUCION')
      ) ?? null),
    );
  }
}
