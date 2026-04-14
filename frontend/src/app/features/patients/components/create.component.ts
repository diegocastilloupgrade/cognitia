import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CreatePatientDto, PatientsService } from '../services/patients.service';

@Component({
  selector: 'app-patient-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreatePatientComponent {
  form: CreatePatientDto = {
    fullName: '',
    birthDate: '',
    sex: '',
    internalCode: '',
  };
  saving = false;
  error: string | null = null;

  constructor(
    private patientsService: PatientsService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.fullName.trim() || !this.form.birthDate) {
      return;
    }

    this.error = null;
    this.saving = true;
    this.patientsService
      .createPatient({
        fullName: this.form.fullName.trim(),
        birthDate: this.form.birthDate,
        sex: this.form.sex?.trim() || undefined,
        internalCode: this.form.internalCode?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.form = { fullName: '', birthDate: '', sex: '', internalCode: '' };
          this.saving = false;
          this.router.navigate(['/patients']);
        },
        error: () => {
          this.error = 'Error al crear el paciente.';
          this.saving = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }
}
