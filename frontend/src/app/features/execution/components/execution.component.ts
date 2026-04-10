import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExecutionService, ItemResultData_3_1, ItemResultPayload } from '../services/execution.service';
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
  results: ItemResultPayload[] = [];

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
    }
  }

  showNextStimulus(): void {
    if (this.currentStimulusIndex < this.visibleStimuli.length - 1) {
      this.currentStimulusIndex++;
    }
  }

  saveCurrentStimulusAsSeen(): void {
    const stimulus = this.currentStimulus;
    if (!stimulus || !this.session) return;

    const positionInSession = this.currentStimulusIndex + 1;

    const isItem31 = stimulus.itemCode === '3.1';
    let data: any = { stimulusId: stimulus.id };

    if (isItem31) {
      const data31: ItemResultData_3_1 = {
        stimulusId: stimulus.id,
        recognizedText: '<TODO_ASR_O_TEXTO_DEMENTIRA_DE_MOMENTO>',
        isCorrect: true
      };

      const typedPayloadPreview: ItemResultPayload<ItemResultData_3_1> = {
        sessionId: this.session.id,
        itemCode: stimulus.itemCode,
        positionInSession,
        evaluatedOutcome: 'NO_APLICA',
        data: data31
      };
      void typedPayloadPreview;
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
}
