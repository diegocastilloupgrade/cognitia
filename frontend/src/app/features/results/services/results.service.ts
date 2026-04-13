import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ScreeningSession } from '../../../shared/models/session.models';

export type EvaluatedOutcome = 'ACIERTO' | 'ERROR' | 'OMISION' | 'NO_APLICA';

export interface ReviewResultItem {
  id: number;
  sessionId: number;
  itemCode: string;
  positionInSession: number;
  createdAt: string;
  evaluatedOutcome: EvaluatedOutcome;
  data: Record<string, unknown>;
}

export interface SessionReviewSummary {
  totalResults: number;
  distinctItems: number;
  outcomes: Record<EvaluatedOutcome, number>;
  averageResponseTimeMs: number | null;
}

export interface SessionReviewResponse {
  sessionId: number;
  summary: SessionReviewSummary;
  results: ReviewResultItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private readonly sessionsUrl = `${environment.apiBaseUrl}/sessions`;
  private readonly resultsUrl = `${environment.apiBaseUrl}/results`;

  constructor(private http: HttpClient) {}

  getCompletedSessions(): Observable<ScreeningSession[]> {
    return this.http
      .get<ScreeningSession[]>(this.sessionsUrl)
      .pipe(map((sessions) => sessions.filter((session) => session.status === 'COMPLETADA')));
  }

  getSessionReview(sessionId: number): Observable<SessionReviewResponse> {
    return this.http.get<SessionReviewResponse>(`${this.resultsUrl}/session/${sessionId}/review`);
  }
}
