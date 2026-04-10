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
    if (!this.form.patientId) return;
    this.sessionsService.createSession(this.form).subscribe({
      next: () => {
        this.form = { patientId: 0, createdByUserId: 1 };
        this.loadSessions();
      },
      error: () => {
        this.error = 'Error al crear la sesión.';
      }
    });
  }
}
