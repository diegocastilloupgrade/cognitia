import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService, UpdatePatientDto } from '../services/patients.service';

@Component({
  selector: 'app-patient-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class PatientEditComponent implements OnInit {
  patientId = 0;
  form: UpdatePatientDto = { fullName: '', birthDate: '' };
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.patientId || Number.isNaN(this.patientId)) {
      this.error = 'ID de paciente inválido.';
      return;
    }

    this.loading = true;
    this.patientsService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.form = {
          fullName: patient.fullName,
          birthDate: patient.birthDate
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el paciente.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.form.fullName?.trim() || !this.form.birthDate) {
      this.error = 'Nombre y fecha de nacimiento son obligatorios.';
      return;
    }

    this.error = null;
    this.success = null;
    this.saving = true;
    this.patientsService
      .updatePatient(this.patientId, {
        fullName: this.form.fullName.trim(),
        birthDate: this.form.birthDate
      })
      .subscribe({
        next: () => {
          this.success = 'Paciente actualizado correctamente.';
          this.saving = false;
          setTimeout(() => this.router.navigate(['/patients']), 500);
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Error al actualizar paciente.';
          this.saving = false;
        }
      });
  }
}
