import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AnyItemResultPayload,
  AvatarFeedbackPayload,
  ExecutionService,
  ItemCode,
  ItemResultData_3_1,
  ItemTimingState
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

  visibleStimuli: Stimulus[] = STIMULI_DEMO;
  currentStimulusIndex = 0;
  results: AnyItemResultPayload[] = [];
  currentItemCode: ItemCode | '' = '';
  currentTimingState?: ItemTimingState;
  sessionTimingStates: ItemTimingState[] = [];
  latestAvatarFeedback: AvatarFeedbackPayload | null = null;

  get currentStimulus(): Stimulus | null {
    return this.visibleStimuli[this.currentStimulusIndex] ?? null;
  }

  constructor(
    private route: ActivatedRoute,
    private executionService: ExecutionService
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSession();
    this.loadResults();
    this.updateCurrentItemCode();
    this.loadSessionTimingStates();
    this.refreshCurrentTimingState();
  }

  loadSession(): void {
    this.loading = true;
    this.error = null;
    this.executionService.getSession(this.sessionId).subscribe({
      next: (data) => {
        this.session = data;
        this.loading = false;
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

  startSession(): void {
    this.executionService.startSession(this.sessionId).subscribe({
      next: (data) => { this.session = data; },
      error: () => { this.error = 'Error al iniciar la sesión.'; }
    });
  }

  completeSession(): void {
    this.executionService.completeSession(this.sessionId).subscribe({
      next: (data) => { this.session = data; },
      error: () => { this.error = 'Error al finalizar la sesión.'; }
    });
  }

  showPreviousStimulus(): void {
    if (this.currentStimulusIndex > 0) {
      this.currentStimulusIndex--;
      this.updateCurrentItemCode();
      this.refreshCurrentTimingState();
    }
  }

  showNextStimulus(): void {
    if (this.currentStimulusIndex < this.visibleStimuli.length - 1) {
      this.currentStimulusIndex++;
      this.updateCurrentItemCode();
      this.refreshCurrentTimingState();
    }
  }

  updateCurrentItemCode(): void {
    this.currentItemCode = this.currentStimulus?.itemCode ?? '';
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

  startCurrentItemTiming(): void {
    if (!this.currentItemCode) return;

    this.executionService.startItemTiming(this.sessionId, this.currentItemCode).subscribe({
      next: () => {
        this.refreshCurrentTimingState();
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al iniciar timing del ítem.'; }
    });
  }

  registerFirstSilence(): void {
    if (!this.currentItemCode) return;

    this.executionService.registerSilence(this.sessionId, this.currentItemCode, 1).subscribe({
      next: (response) => {
        this.currentTimingState = response.state;
        this.latestAvatarFeedback = response.avatarFeedback;
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
        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al registrar el segundo silencio.'; }
    });
  }

  completeCurrentItemTiming(): void {
    if (!this.currentItemCode) return;

    this.executionService.completeItemTiming(this.sessionId, this.currentItemCode).subscribe({
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

        if (response.activeItem?.itemCode) {
          this.currentItemCode = response.activeItem.itemCode;
        }

        this.loadSessionTimingStates();
      },
      error: () => { this.error = 'Error al completar timing del ítem.'; }
    });
  }

  saveCurrentStimulusAsSeen(): void {
    const stimulus = this.currentStimulus;
    if (!stimulus || !this.session) return;

    const positionInSession = this.currentStimulusIndex + 1;

    const isItem31 = stimulus.itemCode === '3.1';
    const fallbackData: ItemResultData_3_1 = {
      stimulusId: stimulus.id,
      recognizedText: '<TODO_ASR_O_TEXTO_DEMENTIRA_DE_MOMENTO>',
      isCorrect: true,
      responseTimeMs: 0,
    };

    let data = fallbackData;

    if (isItem31) {
      const data31: ItemResultData_3_1 = {
        stimulusId: stimulus.id,
        recognizedText: '<TODO_ASR_O_TEXTO_DEMENTIRA_DE_MOMENTO>',
        isCorrect: true
      };

      data = data31;
    }

    this.executionService.saveStimulusResult({
      sessionId: this.session.id,
      itemCode: stimulus.itemCode,
      positionInSession,
      evaluatedOutcome: 'NO_APLICA',
      data
    }).subscribe({
      next: (result) => { this.results = [...this.results, result]; },
      error: () => { this.error = 'Error al registrar el estímulo.'; }
    });
  }

  getResultStimulusId(result: AnyItemResultPayload): string {
    if (result.itemCode !== '3.1') {
      return '—';
    }

    const data = result.data as Partial<ItemResultData_3_1>;
    return typeof data.stimulusId === 'string' ? data.stimulusId : '—';
  }
}
