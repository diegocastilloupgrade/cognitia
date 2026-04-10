import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export { ScreeningSessionStatus, ScreeningSession } from '../../../shared/models/session.models';
import { ScreeningSession } from '../../../shared/models/session.models';

export interface CreateSessionDto {
  patientId: number;
  createdByUserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<ScreeningSession[]> {
    return this.http.get<ScreeningSession[]>(this.baseUrl);
  }

  createSession(dto: CreateSessionDto): Observable<ScreeningSession> {
    return this.http.post<ScreeningSession>(this.baseUrl, dto);
  }
}
