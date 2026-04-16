import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { SessionDetailComponent } from './detail.component';
import { SessionsService } from '../services/sessions.service';

describe('SessionDetailComponent', () => {
  let component: SessionDetailComponent;
  let fixture: ComponentFixture<SessionDetailComponent>;
  let sessionsService: jasmine.SpyObj<SessionsService>;

  beforeEach(async () => {
    sessionsService = jasmine.createSpyObj<SessionsService>('SessionsService', [
      'getSessionById',
      'startSession',
      'completeSession',
      'getSessionResults'
    ]);

    sessionsService.getSessionById.and.returnValue(of({
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'BORRADOR'
    } as any));

    sessionsService.startSession.and.returnValue(of({
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'EN_EJECUCION',
      startedAt: '2025-01-01T10:00:00.000Z'
    } as any));

    sessionsService.completeSession.and.returnValue(of({
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'COMPLETADA',
      startedAt: '2025-01-01T10:00:00.000Z',
      finishedAt: '2025-01-01T10:30:00.000Z'
    } as any));

    sessionsService.getSessionResults.and.returnValue(of([{ id: 1 } as any]));

    await TestBed.configureTestingModule({
      declarations: [SessionDetailComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        { provide: SessionsService, useValue: sessionsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows BORRADOR status label and class', () => {
    expect(component.statusLabel).toBe('Borrador');
    expect(component.statusClass).toBe('badge badge-borrador');
  });

  it('opens start confirmation and transitions to EN_EJECUCION', () => {
    component.onStartClick();
    expect(component.showStartConfirm).toBeTrue();

    component.onStartConfirm();

    expect(sessionsService.startSession).toHaveBeenCalledWith(1);
    expect(component.session?.status).toBe('EN_EJECUCION');
    expect(component.showStartConfirm).toBeFalse();
  });

  it('opens complete confirmation and transitions to COMPLETADA', () => {
    component.session = {
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'EN_EJECUCION',
      startedAt: '2025-01-01T10:00:00.000Z'
    } as any;

    component.onCompleteClick();
    expect(component.showCompleteConfirm).toBeTrue();

    component.onCompleteConfirm();

    expect(sessionsService.completeSession).toHaveBeenCalledWith(1);
    expect(component.session?.status).toBe('COMPLETADA');
    expect(component.showCompleteConfirm).toBeFalse();
  });

  it('shows backend message when start transition fails', () => {
    sessionsService.startSession.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'Solo sesiones en BORRADOR pueden iniciarse.' } }))
    );

    component.onStartClick();
    component.onStartConfirm();

    expect(component.error).toBe('Solo sesiones en BORRADOR pueden iniciarse.');
    expect(component.showStartConfirm).toBeFalse();
  });

  it('shows 404 message when session is not found', () => {
    sessionsService.getSessionById.and.returnValue(throwError(() => ({ status: 404 })));

    component.loadSession(123);

    expect(component.error).toBe('Sesión no encontrada.');
  });

  it('shows start action only for BORRADOR', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Iniciar ejecución');
    expect(text).not.toContain('Completar sesión');
  });

  it('shows complete action only for EN_EJECUCION', () => {
    component.session = {
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'EN_EJECUCION',
      startedAt: '2025-01-01T10:00:00.000Z'
    } as any;
    component.resultsCount = 1;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Completar sesión');
    expect(text).not.toContain('Iniciar ejecución');
  });

  it('disables start when readiness preconditions fail', () => {
    component.session = {
      id: 1,
      patientId: 0,
      createdByUserId: 1,
      status: 'BORRADOR'
    } as any;

    fixture.detectChanges();

    expect(component.isReadyForExecution).toBeFalse();
    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('shows checklist indicators for BORRADOR state', () => {
    component.session = {
      id: 1,
      patientId: 10,
      createdByUserId: 1,
      status: 'BORRADOR'
    } as any;

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Checklist de preparación');
    expect(text).toContain('Paciente');
    expect(text).toContain('Campos requeridos');
  });
});
