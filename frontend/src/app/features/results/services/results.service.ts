import { Injectable } from '@angular/core';

export interface Result {
  id: string;
  sessionId: string;
  score: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  getResults() {
    return Promise.resolve([]);
  }
}
