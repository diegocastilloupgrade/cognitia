import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ExecutionComponent } from './execution.component';
import { ExecutionService, ItemTimingState } from '../services/execution.service';

describe('ExecutionComponent', () => {
  let component: ExecutionComponent;
  let fixture: ComponentFixture<ExecutionComponent>;
  let executionService: jasmine.SpyObj<ExecutionService>;

  const session = {
    id: 1,
    patientId: 1,
    therapistId: 'demo',
    status: 'EN_EJECUCION',
    createdAt: '2026-04-10T00:00:00.000Z',
    startedAt: '2026-04-10T00:01:00.000Z',
    finishedAt: null,
  };

  const timingState: ItemTimingState = {
    sessionId: 1,
    itemCode: '3.1',
    startedAt: '2026-04-10T00:02:00.000Z',
    durationSeconds: 60,
    silenceThresholdSeconds: 5,
    silenceEvents: [],
    completed: false,
  };

  beforeEach(async () => {
    executionService = jasmine.createSpyObj<ExecutionService>('ExecutionService', [
      'getSession',
      'startSession',
      'completeSession',
      'getResultsForSession',
      'saveStimulusResult',
      'getItemTimingState',
      'getSessionTimingStates',
      'startItemTiming',
      'registerSilence',
      'completeItemTiming',
    ]);

    executionService.getSession.and.returnValue(of(session as any));
    executionService.startSession.and.returnValue(of(session as any));
    executionService.completeSession.and.returnValue(of({ ...session, status: 'COMPLETADA' } as any));
    executionService.getResultsForSession.and.returnValue(of([]));
    executionService.saveStimulusResult.and.returnValue(of({
      sessionId: 1,
      itemCode: '3.1',
      positionInSession: 1,
      evaluatedOutcome: 'NO_APLICA',
      data: { stimulusId: '3.1-1-guitarra' },
    }));
    executionService.getItemTimingState.and.returnValue(of(timingState));
    executionService.getSessionTimingStates.and.returnValue(of([timingState]));
    executionService.startItemTiming.and.returnValue(of(timingState));
    executionService.registerSilence.and.returnValue(
      of({
        state: {
          ...timingState,
          silenceEvents: [
            { occurredAt: '2026-04-10T00:03:00.000Z', type: 'FIRST_SILENCE' },
          ],
        },
        avatarFeedback: {
          messageCode: 'SILENCE_FIRST_PROMPT',
          text: 'Tómate un momento y responde cuando estés listo.'
        }
      })
    );
    executionService.completeItemTiming.and.returnValue(of({ ...timingState, completed: true }));

    await TestBed.configureTestingModule({
      declarations: [ExecutionComponent],
      imports: [CommonModule],
      providers: [
        { provide: ExecutionService, useValue: executionService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads session, results and timing state on init', () => {
    expect(executionService.getSession).toHaveBeenCalledWith(1);
    expect(executionService.getResultsForSession).toHaveBeenCalledWith(1);
    expect(executionService.getSessionTimingStates).toHaveBeenCalledWith(1);
    expect(executionService.getItemTimingState).toHaveBeenCalledWith(1, '3.1');
    expect(component.currentItemCode).toBe('3.1');
    expect(component.currentTimingState).toEqual(timingState);
    expect(component.sessionTimingStates).toEqual([timingState]);
  });

  it('starts timing for current item and refreshes state collections', () => {
    executionService.getItemTimingState.calls.reset();
    executionService.getSessionTimingStates.calls.reset();

    component.startCurrentItemTiming();

    expect(executionService.startItemTiming).toHaveBeenCalledWith(1, '3.1');
    expect(executionService.getItemTimingState).toHaveBeenCalledWith(1, '3.1');
    expect(executionService.getSessionTimingStates).toHaveBeenCalledWith(1);
  });

  it('registers silence and completes timing for current item', () => {
    component.registerFirstSilence();
    component.registerSecondSilence();
    component.completeCurrentItemTiming();

    expect(executionService.registerSilence).toHaveBeenCalledWith(1, '3.1', 1);
    expect(executionService.registerSilence).toHaveBeenCalledWith(1, '3.1', 2);
    expect(executionService.completeItemTiming).toHaveBeenCalledWith(1, '3.1');
    expect(component.latestAvatarFeedback?.messageCode).toBe('SILENCE_FIRST_PROMPT');
  });
});