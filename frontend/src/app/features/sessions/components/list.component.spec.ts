import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { SessionsListComponent } from './list.component';
import { SessionsService } from '../services/sessions.service';

describe('SessionsListComponent', () => {
  let component: SessionsListComponent;
  let fixture: ComponentFixture<SessionsListComponent>;
  let sessionsService: jasmine.SpyObj<SessionsService>;

  beforeEach(async () => {
    sessionsService = jasmine.createSpyObj<SessionsService>('SessionsService', [
      'getSessions',
      'createSession',
      'getOpenSessionByPatientId',
      'deleteSession',
      'startSession',
    ]);

    sessionsService.getSessions.and.returnValue(
      of([{ id: 10, patientId: 1, createdByUserId: 1, status: 'COMPLETADA' } as any]),
    );
    sessionsService.createSession.and.returnValue(
      of({ id: 11, patientId: 2, createdByUserId: 1, status: 'BORRADOR' } as any),
    );
    sessionsService.getOpenSessionByPatientId.and.returnValue(of(null));
    sessionsService.deleteSession.and.returnValue(of(void 0));
    sessionsService.startSession.and.returnValue(
      of({ id: 22, patientId: 1, createdByUserId: 1, status: 'EN_EJECUCION' } as any),
    );

    await TestBed.configureTestingModule({
      declarations: [SessionsListComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: SessionsService, useValue: sessionsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows warning and blocks submit when open session exists', () => {
    sessionsService.getOpenSessionByPatientId.and.returnValue(
      of({ id: 99, patientId: 2, createdByUserId: 1, status: 'EN_EJECUCION' } as any),
    );

    component.form.patientId = 2;
    component.onPatientIdChange();

    expect(component.existingOpenSession?.id).toBe(99);
    expect(component.warning).toContain('ya tiene una sesión abierta');

    component.onSubmit();
    expect(sessionsService.createSession).not.toHaveBeenCalled();
  });

  it('creates session when there is no open session', () => {
    component.form.patientId = 3;
    component.onPatientIdChange();
    component.onSubmit();

    expect(sessionsService.createSession).toHaveBeenCalledWith({
      patientId: 3,
      createdByUserId: 1,
    });
  });

  it('handles backend 409 conflict with friendly message', () => {
    sessionsService.createSession.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'Patient already has an open session' } })),
    );

    component.form.patientId = 7;
    component.onPatientIdChange();
    component.onSubmit();

    expect(component.error).toBe('Patient already has an open session');
  });

  it('returns status label and class for each known state', () => {
    expect(component.statusLabel('BORRADOR')).toBe('Borrador');
    expect(component.statusLabel('EN_EJECUCION')).toBe('En ejecución');
    expect(component.statusLabel('COMPLETADA')).toBe('Completada');

    expect(component.statusClass('BORRADOR')).toBe('badge badge-borrador');
    expect(component.statusClass('EN_EJECUCION')).toBe('badge badge-ejecucion');
    expect(component.statusClass('COMPLETADA')).toBe('badge badge-completada');
  });

  it('deletes BORRADOR session after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadSessions');

    const session = { id: 22, patientId: 1, createdByUserId: 1, status: 'BORRADOR' } as any;
    component.onDeleteSession(session);

    expect(sessionsService.deleteSession).toHaveBeenCalledWith(22);
    expect(component.loadSessions).toHaveBeenCalled();
  });

  it('does not delete non-BORRADOR session', () => {
    spyOn(window, 'alert');
    spyOn(window, 'confirm');

    const session = { id: 30, patientId: 1, createdByUserId: 1, status: 'EN_EJECUCION' } as any;
    component.onDeleteSession(session);

    expect(window.alert).toHaveBeenCalledWith('No se puede eliminar sesiones en ejecución o completadas.');
    expect(window.confirm).not.toHaveBeenCalled();
    expect(sessionsService.deleteSession).not.toHaveBeenCalled();
  });

  it('starts BORRADOR session after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadSessions');

    const session = { id: 22, patientId: 1, createdByUserId: 1, status: 'BORRADOR' } as any;
    component.onStartSession(session);

    expect(sessionsService.startSession).toHaveBeenCalledWith(22);
    expect(component.loadSessions).toHaveBeenCalled();
  });

  it('returns completion summary for completed sessions', () => {
    const summary = component.completionSummary({
      id: 1,
      patientId: 2,
      createdByUserId: 3,
      status: 'COMPLETADA',
      finishedAt: '2026-04-14T14:30:00.000Z',
    } as any);

    expect(summary).toContain('✓ Completado el');
  });
});
