import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  active: boolean;
  sex?: string;
  internalCode?: string;
}

export interface CreatePatientDto {
  fullName: string;
  birthDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl);
  }

  createPatient(dto: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(this.baseUrl, dto);
  }
}
