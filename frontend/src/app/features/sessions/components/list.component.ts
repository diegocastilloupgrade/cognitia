import { Component, OnInit } from '@angular/core';
import { SessionsService, ScreeningSession, CreateSessionDto } from '../services/sessions.service';

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
