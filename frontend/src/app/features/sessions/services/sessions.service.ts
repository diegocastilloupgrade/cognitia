import { Injectable } from '@angular/core';

export interface Session {
  id: string;
  patientId: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  getSessions() {
    return Promise.resolve([]);
  }
}
