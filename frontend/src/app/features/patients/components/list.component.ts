import { Component, OnInit } from '@angular/core';
import { PatientsService, Patient, CreatePatientDto } from '../services/patients.service';

@Component({
  selector: 'app-patients-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];
  form: CreatePatientDto = { fullName: '', birthDate: '' };
  loading = false;
  error: string | null = null;
  deletingPatientId: number | null = null;

  constructor(private patientsService: PatientsService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;
    this.patientsService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pacientes.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.form.fullName.trim() || !this.form.birthDate) return;
    this.patientsService.createPatient(this.form).subscribe({
      next: () => {
        this.form = { fullName: '', birthDate: '' };
        this.loadPatients();
      },
      error: () => {
        this.error = 'Error al crear el paciente.';
      }
    });
  }

  onDelete(patient: Patient): void {
    const confirmed = window.confirm(`¿Eliminar al paciente "${patient.fullName}"?`);
    if (!confirmed) {
      return;
    }

    this.error = null;
    this.deletingPatientId = patient.id;
    this.patientsService.deletePatient(patient.id).subscribe({
      next: () => {
        this.patients = this.patients.filter((p) => p.id !== patient.id);
        this.deletingPatientId = null;
      },
      error: (err) => {
        if (err?.status === 409) {
          this.error = 'No se puede eliminar: el paciente tiene sesiones activas.';
        } else {
          this.error = 'Error al eliminar el paciente.';
        }
        this.deletingPatientId = null;
      }
    });
  }
}
