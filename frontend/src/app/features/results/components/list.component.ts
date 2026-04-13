import { Component, OnInit } from '@angular/core';
import { ScreeningSession } from '../../../shared/models/session.models';
import {
  ResultsService,
  SessionReviewResponse,
  ReviewResultItem,
  EvaluatedOutcome,
} from '../services/results.service';

type EstadoRevision = 'inactivo' | 'cargando' | 'listo' | 'vacío' | 'error';

@Component({
  selector: 'app-results-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ResultsListComponent implements OnInit {
  estado: EstadoRevision = 'inactivo';
  mensajeError: string | null = null;

  sessionIdFiltro = '';
  patientIdFiltro = '';

  sesionesCompletadas: ScreeningSession[] = [];
  revision: SessionReviewResponse | null = null;
  private ultimaSesionConsultada: number | null = null;

  constructor(private resultsService: ResultsService) {}

  ngOnInit(): void {
    this.cargarSesionesCompletadas();
  }

  get sesionesFiltradas(): ScreeningSession[] {
    const patientId = Number(this.patientIdFiltro);
    if (!this.patientIdFiltro || Number.isNaN(patientId)) {
      return this.sesionesCompletadas;
    }

    return this.sesionesCompletadas.filter((session) => session.patientId === patientId);
  }

  cargarSesionesCompletadas(): void {
    this.resultsService.getCompletedSessions().subscribe({
      next: (sessions) => {
        this.sesionesCompletadas = sessions;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las sesiones completadas.';
      },
    });
  }

  buscarRevisionPorSesion(): void {
    const sessionId = Number(this.sessionIdFiltro);
    if (Number.isNaN(sessionId) || sessionId <= 0) {
      this.estado = 'error';
      this.mensajeError = 'Debes indicar un ID de sesión válido.';
      return;
    }

    this.cargarRevision(sessionId);
  }

  abrirRevision(sessionId: number): void {
    this.sessionIdFiltro = String(sessionId);
    this.cargarRevision(sessionId);
  }

  reintentar(): void {
    if (this.ultimaSesionConsultada === null) {
      return;
    }

    this.cargarRevision(this.ultimaSesionConsultada);
  }

  resumenData(item: ReviewResultItem): string {
    const entries = Object.entries(item.data ?? {});
    if (entries.length === 0) {
      return '-';
    }

    return entries
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
  }

  claseOutcome(outcome: EvaluatedOutcome): string {
    switch (outcome) {
      case 'ACIERTO':
        return 'outcome-acierto';
      case 'ERROR':
        return 'outcome-error';
      case 'OMISION':
        return 'outcome-omision';
      default:
        return 'outcome-no-aplica';
    }
  }

  private cargarRevision(sessionId: number): void {
    this.estado = 'cargando';
    this.mensajeError = null;
    this.revision = null;
    this.ultimaSesionConsultada = sessionId;

    this.resultsService.getSessionReview(sessionId).subscribe({
      next: (review) => {
        this.revision = review;
        this.estado = review.results.length === 0 ? 'vacío' : 'listo';
      },
      error: () => {
        this.estado = 'error';
        this.mensajeError = 'No se pudo cargar la revisión clínica de la sesión.';
      },
    });
  }
}
