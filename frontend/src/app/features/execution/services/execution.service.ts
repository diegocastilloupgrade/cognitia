import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {
  startExecution() {
    return Promise.resolve({ status: 'started' });
  }

  stopExecution() {
    return Promise.resolve({ status: 'stopped' });
  }
}
