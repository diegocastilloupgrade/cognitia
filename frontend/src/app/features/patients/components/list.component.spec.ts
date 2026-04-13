import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PatientsListComponent } from './list.component';
import { PatientsService } from '../services/patients.service';

describe('PatientsListComponent', () => {
  let component: PatientsListComponent;
  let fixture: ComponentFixture<PatientsListComponent>;
  let patientsService: jasmine.SpyObj<PatientsService>;

  beforeEach(async () => {
    patientsService = jasmine.createSpyObj<PatientsService>('PatientsService', [
      'getPatients',
      'createPatient',
      'deletePatient',
    ]);

    patientsService.getPatients.and.returnValue(
      of([
        { id: 1, fullName: 'Paciente A', birthDate: '1990-01-01', active: true },
        { id: 2, fullName: 'Paciente B', birthDate: '1991-02-02', active: true },
      ]),
    );
    patientsService.createPatient.and.returnValue(
      of({ id: 3, fullName: 'Paciente C', birthDate: '1992-03-03', active: true }),
    );
    patientsService.deletePatient.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      declarations: [PatientsListComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: PatientsService, useValue: patientsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads patients on init', () => {
    expect(patientsService.getPatients).toHaveBeenCalled();
    expect(component.patients.length).toBe(2);
  });

  it('deletes patient and updates list', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    const patient = component.patients[0];
    component.onDelete(patient);

    expect(patientsService.deletePatient).toHaveBeenCalledWith(patient.id);
    expect(component.patients.find((p) => p.id === patient.id)).toBeUndefined();
  });

  it('shows conflict error on delete when patient has open sessions', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    patientsService.deletePatient.and.returnValue(throwError(() => ({ status: 409 })));

    component.onDelete(component.patients[0]);

    expect(component.error).toBe('No se puede eliminar: el paciente tiene sesiones activas.');
  });
});
