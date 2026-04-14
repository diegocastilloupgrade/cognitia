import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PatientEditComponent } from './edit.component';
import { PatientsService } from '../services/patients.service';

describe('PatientEditComponent', () => {
  let component: PatientEditComponent;
  let fixture: ComponentFixture<PatientEditComponent>;
  let patientsService: jasmine.SpyObj<PatientsService>;
  let router: Router;

  beforeEach(async () => {
    patientsService = jasmine.createSpyObj<PatientsService>('PatientsService', [
      'getPatientById',
      'updatePatient',
    ]);

    patientsService.getPatientById.and.returnValue(
      of({
        id: 1,
        fullName: 'Paciente Inicial',
        birthDate: '1990-01-01',
        sex: 'F',
        internalCode: 'PX-001',
        active: true,
      }),
    );
    patientsService.updatePatient.and.returnValue(
      of({
        id: 1,
        fullName: 'Paciente Editado',
        birthDate: '1990-01-01',
        sex: 'F',
        internalCode: 'PX-001',
        active: false,
      }),
    );

    await TestBed.configureTestingModule({
      declarations: [PatientEditComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: PatientsService, useValue: patientsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (_key: string) => '1',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientEditComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('loads patient on init', () => {
    fixture.detectChanges();

    expect(patientsService.getPatientById).toHaveBeenCalledWith(1);
    expect(component.form.fullName).toBe('Paciente Inicial');
    expect(component.form.birthDate).toBe('1990-01-01');
    expect(component.form.sex).toBe('F');
    expect(component.form.internalCode).toBe('PX-001');
    expect(component.form.active).toBeTrue();
  });

  it('submits update and navigates to list', fakeAsync(() => {
    fixture.detectChanges();

    component.form.fullName = 'Paciente Editado';
    component.form.birthDate = '1991-02-02';
    component.form.sex = 'M';
    component.form.internalCode = 'PX-999';
    component.form.active = false;
    component.onSubmit();

    expect(patientsService.updatePatient).toHaveBeenCalledWith(1, {
      fullName: 'Paciente Editado',
      birthDate: '1991-02-02',
      sex: 'M',
      internalCode: 'PX-999',
      active: false,
    });
    expect(component.success).toBe('Paciente actualizado correctamente.');

    tick(500);
    expect(router.navigate).toHaveBeenCalledWith(['/patients']);
  }));

  it('shows backend error message on update failure', () => {
    patientsService.updatePatient.and.returnValue(
      throwError(() => ({ error: { message: 'Dato inválido' } })),
    );

    fixture.detectChanges();
    component.onSubmit();

    expect(component.error).toBe('Dato inválido');
  });
});
