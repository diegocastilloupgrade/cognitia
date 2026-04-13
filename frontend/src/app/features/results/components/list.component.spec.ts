import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ResultsListComponent } from './list.component';
import { ResultsService } from '../services/results.service';

describe('ResultsListComponent', () => {
  let component: ResultsListComponent;
  let fixture: ComponentFixture<ResultsListComponent>;
  let resultsService: jasmine.SpyObj<ResultsService>;

  beforeEach(async () => {
    resultsService = jasmine.createSpyObj<ResultsService>('ResultsService', [
      'getCompletedSessions',
      'getSessionReview',
    ]);

    resultsService.getCompletedSessions.and.returnValue(
      of([
        { id: 11, patientId: 5, createdByUserId: 1, status: 'COMPLETADA' },
        { id: 12, patientId: 8, createdByUserId: 1, status: 'COMPLETADA' },
      ] as any)
    );

    resultsService.getSessionReview.and.returnValue(
      of({
        sessionId: 11,
        summary: {
          totalResults: 1,
          distinctItems: 1,
          averageResponseTimeMs: 900,
          outcomes: {
            ACIERTO: 1,
            ERROR: 0,
            OMISION: 0,
            NO_APLICA: 0,
          },
        },
        results: [
          {
            id: 1,
            sessionId: 11,
            itemCode: '3.1',
            positionInSession: 1,
            evaluatedOutcome: 'ACIERTO',
            createdAt: '2026-04-12T12:00:00.000Z',
            data: {
              stimulusId: 'img-01',
              recognizedText: 'guitarra',
            },
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      declarations: [ResultsListComponent],
      imports: [CommonModule, FormsModule],
      providers: [{ provide: ResultsService, useValue: resultsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga sesiones completadas al iniciar', () => {
    expect(resultsService.getCompletedSessions).toHaveBeenCalled();
    expect(component.sesionesCompletadas.length).toBe(2);
  });

  it('muestra estado listo al cargar una revisión con resultados', () => {
    component.sessionIdFiltro = '11';

    component.buscarRevisionPorSesion();

    expect(resultsService.getSessionReview).toHaveBeenCalledWith(11);
    expect(component.estado).toBe('listo');
    expect(component.revision?.summary.totalResults).toBe(1);
  });

  it('muestra estado de error y permite reintentar', () => {
    resultsService.getSessionReview.and.returnValues(
      throwError(() => new Error('network')),
      of({
        sessionId: 11,
        summary: {
          totalResults: 0,
          distinctItems: 0,
          averageResponseTimeMs: null,
          outcomes: {
            ACIERTO: 0,
            ERROR: 0,
            OMISION: 0,
            NO_APLICA: 0,
          },
        },
        results: [],
      })
    );

    component.sessionIdFiltro = '11';
    component.buscarRevisionPorSesion();

    expect(component.estado).toBe('error');

    component.reintentar();

    expect(resultsService.getSessionReview).toHaveBeenCalledTimes(2);
    expect(component.estado).toBe('vacío');
  });
});
