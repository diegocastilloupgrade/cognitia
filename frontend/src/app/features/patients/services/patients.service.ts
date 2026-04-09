import { Injectable } from '@angular/core';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  getPatients() {
    return Promise.resolve([]);
  }
}
