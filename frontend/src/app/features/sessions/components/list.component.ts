import { Component, OnInit } from '@angular/core';
import {
  SessionsService,
  ScreeningSession,
  ScreeningSessionStatus,
  CreateSessionDto
} from '../services/sessions.service';

@Component({
  selector: 'app-sessions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class SessionsListComponent implements OnInit {
  sessions: ScreeningSession[] = [];
  form: CreateSessionDto = { patientId: 0, createdByUserId: 1 };
  loading = false;
  error: string | null = null;
  warning: string | null = null;
  existingOpenSession: ScreeningSession | null = null;
  submitting = false;
  deletingId: number | null = null;
  startingId: number | null = null;

  constructor(private sessionsService: SessionsService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;
    this.sessionsService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar sesiones.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.form.patientId || this.existingOpenSession) return;
    this.submitting = true;
    this.error = null;
    this.sessionsService.createSession(this.form).subscribe({
      next: () => {
        this.form = { patientId: 0, createdByUserId: 1 };
        this.existingOpenSession = null;
        this.warning = null;
        this.submitting = false;
        this.loadSessions();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.error = err?.error?.message ?? 'El paciente ya tiene una sesión abierta.';
          this.checkForOpenSession();
        } else {
          this.error = 'Error al crear la sesión.';
        }
        this.submitting = false;
      }
    });
  }

  onPatientIdChange(): void {
    this.checkForOpenSession();
  }

  statusLabel(status: ScreeningSessionStatus): string {
    switch (status) {
      case 'BORRADOR': return 'Borrador';
      case 'EN_EJECUCION': return 'En ejecución';
      case 'COMPLETADA': return 'Completada';
      default: return status;
    }
  }

  statusClass(status: ScreeningSessionStatus): string {
    switch (status) {
      case 'BORRADOR': return 'badge badge-borrador';
      case 'EN_EJECUCION': return 'badge badge-ejecucion';
      case 'COMPLETADA': return 'badge badge-completada';
      default: return 'badge';
    }
  }

  onDeleteSession(session: ScreeningSession): void {
    if (session.status !== 'BORRADOR') {
      window.alert('No se puede eliminar sesiones en ejecución o completadas.');
      return;
    }

    const confirmed = window.confirm(`¿Eliminar la sesión #${session.id}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.deletingId = session.id;
    this.error = null;
    this.sessionsService.deleteSession(session.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadSessions();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al eliminar la sesión.';
        this.deletingId = null;
      }
    });
  }

  onStartSession(session: ScreeningSession): void {
    if (session.status !== 'BORRADOR') return;

    const confirmed = window.confirm(`¿Iniciar la sesión #${session.id}?`);
    if (!confirmed) return;

    this.startingId = session.id;
    this.error = null;
    this.sessionsService.startSession(session.id).subscribe({
      next: () => {
        this.startingId = null;
        this.loadSessions();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'No fue posible iniciar la sesión.';
        this.startingId = null;
      }
    });
  }

  completionSummary(session: ScreeningSession): string {
    if (session.status !== 'COMPLETADA' || !session.finishedAt) return '';
    const date = new Date(session.finishedAt).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short'
    });
    return `✓ Completado el ${date}`;
  }

  private checkForOpenSession(): void {
    if (!this.form.patientId || this.form.patientId < 1) {
      this.existingOpenSession = null;
      this.warning = null;
      return;
    }

    this.sessionsService.getOpenSessionByPatientId(this.form.patientId).subscribe({
      next: (session) => {
        this.existingOpenSession = session;
        this.warning = session
          ? 'Este paciente ya tiene una sesión abierta. Debes continuar la sesión existente.'
          : null;
      },
      error: () => {
        this.existingOpenSession = null;
        this.warning = null;
      }
    });
  }
}
