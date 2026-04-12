import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AnyItemResultPayload,
  AvatarFeedbackPayload,
  EvaluatedOutcome,
  ExecutionService,
  ItemCode,
  ItemResultData_3_1,
  ItemTimingState,
  RuntimeSessionStateResponse
} from '../services/execution.service';
import { ScreeningSession } from '../../../shared/models/session.models';
import { Stimulus, STIMULI_DEMO } from '../stimuli.config';

@Component({
  selector: 'app-execution',
  templateUrl: './execution.component.html',
  styleUrls: ['./execution.component.css']
})
export class ExecutionComponent implements OnInit {
  session: ScreeningSession | null = null;
  sessionId = 0;
  loading = false;
  error: string | null = null;

  allStimuli: Stimulus[] = STIMULI_DEMO;
  results: AnyItemResultPayload[] = [];
  currentItemCode: ItemCode | '' = '';
  currentTimingState?: ItemTimingState;
  sessionTimingStates: ItemTimingState[] = [];
  latestAvatarFeedback: AvatarFeedbackPayload | null = null;
  runtimeState: RuntimeSessionStateResponse | null = null;

  get visibleStimuli(): Stimulus[] {
    if (!this.currentItemCode) {
      return [];
    }

    return this.allStimuli.filter((stimulus) => stimulus.itemCode === this.currentItemCode);
  }

  get currentStimulus(): Stimulus | null {
    return this.visibleStimuli[0] ?? null;
  }

  constructor(
    private route: ActivatedRoute,
    private executionService: ExecutionService
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSession();
    this.loadResults();
    this.loadSessionTimingStates();
  }

  loadSession(): void {
    this.loading = true;
    this.error = null;
    this.executionService.getSession(this.sessionId).subscribe({
      next: (data) => {
        this.session = data;
        this.loading = false;
        if (data.status === 'EN_EJECUCION') {
          this.loadRuntimeState();
        }
      },
      error: () => {
        this.error = 'Error al cargar la sesión.';
        this.loading = false;
      }
    });
  }

  loadResults(): void {
    this.executionService.getResultsForSession(this.sessionId).subscribe({
      next: (data) => { this.results = data; },
      error: () => { /* silencioso: puede no haber resultados aún */ }
    });
  }

  loadSessionTimingStates(): void {
    this.executionService.getSessionTimingStates(this.sessionId).subscribe({
      next: (data) => { this.sessionTimingStates = data; },
      error: () => { this.sessionTimingStates = []; }
    });
  }

  loadRuntimeState(): void {
    this.executionService.getRuntimeSessionState(this.sessionId).subscribe({
      next: (state) => {
        this.runtimeState = state;
        if (state.recoveryStatus === 'MISSING_RUNTIME_STATE' || state.recoveryStatus === 'MISSING_ACTIVE_ITEM') {
          this.error = 'La sesión está en ejecución pero su estado runtime no se puede recuperar de forma segura.';
          this.currentItemCode = '';
          this.currentTimingState = undefined;
          return;
        }

        this.currentItemCode = state.activeItem?.itemCode ?? '';
        this.refreshCurrentTimingState();
      },
      error: () => {
        this.runtimeState = null;
        this.currentItemCode = '';
        this.currentTimingState = undefined;
      }
    });
  }

  startSession(): void {
    this.executionService.startSession(this.sessionId).subscribe({
      next: (data) => {
        this.session = data;
        this.loadRuntimeState();
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al iniciar la sesión.'; }
    });
  }

  completeSession(): void {
    this.executionService.completeSession(this.sessionId).subscribe({
      next: (data) => { this.session = data; },
      error: () => { this.error = 'Error al finalizar la sesión.'; }
    });
  }

  refreshCurrentTimingState(): void {
    if (!this.currentItemCode) {
      this.currentTimingState = undefined;
      return;
    }

    this.executionService.getItemTimingState(this.sessionId, this.currentItemCode).subscribe({
      next: (state) => { this.currentTimingState = state; },
      error: () => { this.currentTimingState = undefined; }
    });
  }

  registerFirstSilence(): void {
    if (!this.currentItemCode) return;

    this.executionService.registerSilence(this.sessionId, this.currentItemCode, 1).subscribe({
      next: (response) => {
        this.currentTimingState = response.state;
        this.latestAvatarFeedback = response.avatarFeedback;
        this.loadRuntimeState();
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al registrar el primer silencio.'; }
    });
  }

  registerSecondSilence(): void {
    if (!this.currentItemCode) return;

    this.executionService.registerSilence(this.sessionId, this.currentItemCode, 2).subscribe({
      next: (response) => {
        this.currentTimingState = response.state;
        this.latestAvatarFeedback = response.avatarFeedback;
        this.loadRuntimeState();
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al registrar el segundo silencio.'; }
    });
  }

  completeCurrentItemTiming(): void {
    const stimulus = this.currentStimulus;
    if (!this.currentItemCode || !stimulus) return;

    const payload = this.buildFinalizePayload(stimulus);

    this.executionService.completeItemTiming(this.sessionId, this.currentItemCode, payload).subscribe({
      next: (response) => {
        this.currentTimingState = response.activeItem
          ? {
              sessionId: this.sessionId,
              itemCode: response.activeItem.itemCode,
              startedAt: response.activeItem.startedAt,
              durationSeconds: response.activeItem.durationSeconds,
              silenceThresholdSeconds: response.activeItem.silenceThresholdSeconds,
              silenceEvents: [],
              completed: false,
            }
          : undefined;

        this.currentItemCode = response.activeItem?.itemCode ?? '';
        this.loadResults();
        this.loadRuntimeState();
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al completar timing del ítem.'; }
    });
  }

  buildFinalizePayload(stimulus: Stimulus): {
    positionInSession: number;
    evaluatedOutcome: EvaluatedOutcome;
    resultData: any;
  } {
    switch (stimulus.itemCode) {
      case '3.1':
        return {
          positionInSession: 1,
          evaluatedOutcome: 'ACIERTO',
          resultData: {
            stimulusId: stimulus.id,
            recognizedText: '<TODO_ASR_O_TEXTO_DEMENTIRA_DE_MOMENTO>',
            isCorrect: true,
            responseTimeMs: 0,
          } satisfies ItemResultData_3_1,
        };
      case '3.4.1':
        return {
          positionInSession: 2,
          evaluatedOutcome: 'NO_APLICA',
          resultData: {
            recognizedSequence: [stimulus.label ?? stimulus.id],
            firstErrorIndex: null,
          },
        };
      case '3.4.2':
        return {
          positionInSession: 3,
          evaluatedOutcome: 'NO_APLICA',
          resultData: {
            errors: 0,
            omissions: 0,
          },
        };
      default:
        return {
          positionInSession: this.results.length + 1,
          evaluatedOutcome: 'NO_APLICA',
          resultData: {
            recognizedText: '<TODO_ASR_O_TEXTO_DEMENTIRA_DE_MOMENTO>',
            wasCompleted: true,
            responseTimeMs: 0,
          },
        };
    }
  }

  getResultStimulusId(result: AnyItemResultPayload): string {
    if (result.itemCode !== '3.1') {
      return '—';
    }

    const data = result.data as Partial<ItemResultData_3_1>;
    return typeof data.stimulusId === 'string' ? data.stimulusId : '—';
  }
}
