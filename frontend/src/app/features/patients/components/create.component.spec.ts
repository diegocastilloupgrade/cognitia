import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CreatePatientComponent } from './create.component';
import { PatientsService } from '../services/patients.service';

describe('CreatePatientComponent', () => {
  let component: CreatePatientComponent;
  let fixture: ComponentFixture<CreatePatientComponent>;
  let patientsService: jasmine.SpyObj<PatientsService>;
  let router: Router;

  beforeEach(async () => {
    patientsService = jasmine.createSpyObj<PatientsService>('PatientsService', ['createPatient']);
    patientsService.createPatient.and.returnValue(
      of({ id: 1, fullName: 'Paciente Nuevo', birthDate: '1990-01-01', active: true }),
    );

    await TestBed.configureTestingModule({
      declarations: [CreatePatientComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: PatientsService, useValue: patientsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePatientComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('creates patient and navigates to list on success', () => {
    component.form = {
      fullName: 'Paciente Nuevo',
      birthDate: '1990-01-01',
      sex: 'F',
      internalCode: 'PX-001',
    };

    component.onSubmit();

    expect(patientsService.createPatient).toHaveBeenCalledWith({
      fullName: 'Paciente Nuevo',
      birthDate: '1990-01-01',
      sex: 'F',
      internalCode: 'PX-001',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/patients']);
  });

  it('does not submit when required fields are missing', () => {
    component.form = {
      fullName: '',
      birthDate: '',
      sex: '',
      internalCode: '',
    };

    component.onSubmit();

    expect(patientsService.createPatient).not.toHaveBeenCalled();
  });

  it('shows error when create fails', () => {
    patientsService.createPatient.and.returnValue(throwError(() => new Error('boom')));
    component.form = {
      fullName: 'Paciente Nuevo',
      birthDate: '1990-01-01',
      sex: '',
      internalCode: '',
    };

    component.onSubmit();

    expect(component.error).toBe('Error al crear el paciente.');
  });
});
