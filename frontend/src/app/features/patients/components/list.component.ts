import { Component, OnInit } from '@angular/core';
import { PatientsService, Patient } from '../services/patients.service';

@Component({
  selector: 'app-patients-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  error: string | null = null;
  confirmDeleteId: number | null = null;

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
      error: () => {
        this.error = 'Error al cargar pacientes.';
        this.loading = false;
      }
    });
  }

  askDelete(patientId: number): void {
    this.confirmDeleteId = patientId;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(patient: Patient): void {
    this.error = null;
    this.patientsService.deletePatient(patient.id).subscribe({
      next: () => {
        this.patients = this.patients.filter((p) => p.id !== patient.id);
        this.confirmDeleteId = null;
      },
      error: (err) => {
        if (err?.status === 409) {
          this.error = 'No se puede eliminar: el paciente tiene sesiones activas.';
        } else {
          this.error = 'Error al eliminar el paciente.';
        }
        this.confirmDeleteId = null;
      }
    });
  }
}
