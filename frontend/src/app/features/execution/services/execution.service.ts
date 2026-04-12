import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ScreeningSession } from '../../../shared/models/session.models';

export type EvaluatedOutcome = 'ACIERTO' | 'ERROR' | 'OMISION' | 'NO_APLICA';
export type ItemCode = '3.1' | '3.2' | '3.3' | '3.4.1' | '3.4.2' | '3.5' | '3.6' | '3.7';

export interface ItemResultData_3_1 {
  stimulusId: string;
  recognizedText: string;
  isCorrect: boolean;
  responseTimeMs?: number;
}

export interface ItemResultData_3_2 {
  recognizedText: string;
  responseTimeMs: number;
  wasCompleted: boolean;
}

export interface ItemResultData_3_3 {
  recognizedText: string;
  responseTimeMs: number;
  wasCompleted: boolean;
}

export interface ItemResultData_3_4_1 {
  recognizedSequence: string[];
  firstErrorIndex: number | null;
}

export interface ItemResultData_3_4_2 {
  errors: number;
  omissions: number;
}

export interface ItemResultData_3_5 {
  producedCount: number;
  elapsedSeconds: number;
  recognizedText: string;
}

export interface ItemResultData_3_6 {
  recalledItems: string[];
  recognizedText: string;
}

export interface ItemResultData_3_7 {
  recalledItems: string[];
  cueType: string;
  recognizedText: string;
}

export interface ItemResultDataByCode {
  '3.1': ItemResultData_3_1;
  '3.2': ItemResultData_3_2;
  '3.3': ItemResultData_3_3;
  '3.4.1': ItemResultData_3_4_1;
  '3.4.2': ItemResultData_3_4_2;
  '3.5': ItemResultData_3_5;
  '3.6': ItemResultData_3_6;
  '3.7': ItemResultData_3_7;
}

export interface ItemResultPayload<TCode extends ItemCode = ItemCode> {
  id?: number;
  sessionId: number;
  itemCode: TCode;
  positionInSession: number;
  evaluatedOutcome: EvaluatedOutcome;
  data: ItemResultDataByCode[TCode];
  createdAt?: string;
}

export type DiscriminatedItemResultPayload = {
  [TCode in ItemCode]: ItemResultPayload<TCode>;
}[ItemCode];

export type AnyItemResultPayload = ItemResultPayload<ItemCode>;

export interface SilenceEvent {
  occurredAt: string;
  type: 'FIRST_SILENCE' | 'SECOND_SILENCE';
}

export interface AvatarFeedbackPayload {
  messageCode: 'SILENCE_FIRST_PROMPT' | 'SILENCE_SECOND_PROMPT';
  text: string;
}

export interface RegisterSilenceResponse {
  state: ItemTimingState;
  avatarFeedback: AvatarFeedbackPayload;
}

export interface ItemTimingState {
  sessionId: number;
  itemCode: ItemCode;
  startedAt: string;
  durationSeconds: number;
  silenceThresholdSeconds: number;
  silenceEvents: SilenceEvent[];
  completed: boolean;
}

export interface FinalizeItemResponse {
  sessionId: number;
  completedItem: ItemTimingState;
  runtimeStatus: 'IN_PROGRESS' | 'COMPLETED';
  activeItem: {
    itemCode: ItemCode;
    startedAt: string;
    durationSeconds: number;
    silenceThresholdSeconds: number;
  } | null;
}

export interface RuntimeSessionStateResponse {
  sessionId: number;
  runtimeStatus: 'IN_PROGRESS' | 'COMPLETED';
  activeItem: {
    itemCode: ItemCode;
    startedAt: string;
    durationSeconds: number;
    silenceThresholdSeconds: number;
  } | null;
}

export interface FinalizeItemRequest<TCode extends ItemCode = ItemCode> {
  resultData?: ItemResultDataByCode[TCode];
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

  getResultsForSession(sessionId: number): Observable<AnyItemResultPayload[]> {
    return this.http.get<AnyItemResultPayload[]>(`${this.resultsUrl}/session/${sessionId}`);
  }

  saveStimulusResult<TCode extends ItemCode>(params: {
    sessionId: number;
    itemCode: TCode;
    positionInSession: number;
    evaluatedOutcome: EvaluatedOutcome;
    data: ItemResultDataByCode[TCode];
  }): Observable<ItemResultPayload<TCode>> {
    const { sessionId, itemCode, positionInSession, evaluatedOutcome, data } = params;
    return this.http.post<ItemResultPayload<TCode>>(
      `${this.resultsUrl}/session/${sessionId}`,
      {
        itemCode,
        positionInSession,
        evaluatedOutcome,
        data
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

  getRuntimeSessionState(sessionId: number): Observable<RuntimeSessionStateResponse> {
    return this.http.get<RuntimeSessionStateResponse>(
      `${this.executionUrl}/session/${sessionId}/runtime-state`
    );
  }

  startItemTiming(sessionId: number, itemCode: string): Observable<ItemTimingState> {
    return this.http.post<ItemTimingState>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/start`,
      {}
    );
  }

  registerSilence(sessionId: number, itemCode: string, level: 1 | 2): Observable<RegisterSilenceResponse> {
    return this.http.post<RegisterSilenceResponse>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/silence`,
      {
        level,
        event: {
          source: 'MOCK',
          eventType: 'SILENCE_DETECTED',
          sessionId,
          itemCode,
          occurredAt: new Date().toISOString(),
        }
      }
    );
  }

  completeItemTiming<TCode extends ItemCode>(
    sessionId: number,
    itemCode: TCode,
    payload?: FinalizeItemRequest<TCode>
  ): Observable<FinalizeItemResponse> {
    return this.http.post<FinalizeItemResponse>(
      `${this.executionUrl}/session/${sessionId}/item/${itemCode}/complete`,
      payload ?? {}
    );
  }
}
