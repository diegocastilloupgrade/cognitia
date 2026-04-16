import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionsService, ScreeningSession } from '../services/sessions.service';

interface ReadinessChecklist {
  patientAssigned: boolean;
  requiredFields: boolean;
  scheduledDate: boolean;
  alreadyExecuted: boolean;
}

@Component({
  selector: 'app-session-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class SessionDetailComponent implements OnInit {
  session: ScreeningSession | null = null;
  loading = false;
  error: string | null = null;
  resultsCount = 0;
  loadingResults = false;
  archiving = false;

  showStartConfirm = false;
  showCompleteConfirm = false;
  transitioning = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionsService: SessionsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id) || id < 1) {
      this.error = 'ID de sesión inválido.';
      return;
    }
    this.loadSession(id);
  }

  loadSession(id: number): void {
    this.loading = true;
    this.error = null;
    this.sessionsService.getSessionById(id).subscribe({
      next: (s) => {
        this.session = s;
        this.loadResultsCount(s.id);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.status === 404 ? 'Sesión no encontrada.' : 'Error al cargar la sesión.';
        this.loading = false;
      }
    });
  }

  loadResultsCount(sessionId: number): void {
    this.loadingResults = true;
    this.sessionsService.getSessionResults(sessionId).subscribe({
      next: (results) => {
        this.resultsCount = results.length;
        this.loadingResults = false;
      },
      error: () => {
        this.resultsCount = 0;
        this.loadingResults = false;
      }
    });
  }

  get readiness(): ReadinessChecklist {
    return {
      patientAssigned: Boolean(this.session?.patientId && this.session.patientId > 0),
      requiredFields: Boolean(this.session?.createdByUserId && this.session.createdByUserId > 0),
      scheduledDate: true,
      alreadyExecuted: this.session?.status !== 'BORRADOR'
    };
  }

  get isReadyForExecution(): boolean {
    return this.readiness.patientAssigned && this.readiness.requiredFields && this.readiness.scheduledDate;
  }

  get canCompleteSession(): boolean {
    return this.session?.status === 'EN_EJECUCION' && this.resultsCount > 0;
  }

  get statusLabel(): string {
    switch (this.session?.status) {
      case 'BORRADOR': return 'Borrador';
      case 'EN_EJECUCION': return 'En ejecución';
      case 'COMPLETADA': return 'Completada';
      default: return '';
    }
  }

  get statusClass(): string {
    switch (this.session?.status) {
      case 'BORRADOR': return 'badge badge-borrador';
      case 'EN_EJECUCION': return 'badge badge-ejecucion';
      case 'COMPLETADA': return 'badge badge-completada';
      default: return 'badge';
    }
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatCompletionDate(iso?: string): string {
    if (!iso) return '—';
    return `Completado el ${new Date(iso).toLocaleString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })}`;
  }

  getDuration(): string {
    if (!this.session?.startedAt || !this.session?.finishedAt) return '—';
    const ms = new Date(this.session.finishedAt).getTime() - new Date(this.session.startedAt).getTime();
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return mins > 0 ? `${mins} min ${secs} seg` : `${secs} seg`;
  }

  onStartClick(): void {
    if (!this.isReadyForExecution) return;
    this.showStartConfirm = true;
  }

  onStartCancel(): void {
    this.showStartConfirm = false;
  }

  onStartConfirm(): void {
    if (!this.session) return;
    this.transitioning = true;
    this.error = null;
    this.sessionsService.startSession(this.session.id).subscribe({
      next: (updated) => {
        this.session = updated;
        this.showStartConfirm = false;
        this.transitioning = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al iniciar la sesión.';
        this.showStartConfirm = false;
        this.transitioning = false;
      }
    });
  }

  onCompleteClick(): void {
    if (!this.canCompleteSession) return;
    this.showCompleteConfirm = true;
  }

  onCompleteCancel(): void {
    this.showCompleteConfirm = false;
  }

  onCompleteConfirm(): void {
    if (!this.session) return;
    this.transitioning = true;
    this.error = null;
    this.sessionsService.completeSession(this.session.id).subscribe({
      next: (updated) => {
        this.session = updated;
        this.loadResultsCount(updated.id);
        this.showCompleteConfirm = false;
        this.transitioning = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al completar la sesión.';
        this.showCompleteConfirm = false;
        this.transitioning = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sessions']);
  }

  onArchiveClick(): void {
    window.alert('La funcionalidad de archivo se implementará en una tarea posterior.');
  }

  onDownloadResults(): void {
    if (!this.session) return;
    this.archiving = true;
    this.sessionsService.getSessionResults(this.session.id).subscribe({
      next: (results) => {
        const content = JSON.stringify(results, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `session-${this.session?.id}-results.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.archiving = false;
      },
      error: () => {
        this.error = 'No fue posible descargar los resultados.';
        this.archiving = false;
      }
    });
  }
}
