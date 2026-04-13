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

export type UpdatePatientDto = Partial<CreatePatientDto>;

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/${id}`);
  }

  createPatient(dto: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(this.baseUrl, dto);
  }

  updatePatient(id: number, dto: UpdatePatientDto): Observable<Patient> {
    return this.http.patch<Patient>(`${this.baseUrl}/${id}`, dto);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
