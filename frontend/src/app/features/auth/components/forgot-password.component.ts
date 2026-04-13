import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  debugToken: string | null = null;

  constructor(private readonly authService: AuthService) {}

  submit(): void {
    if (this.loading || !this.email.trim()) {
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.debugToken = null;

    this.authService.forgotPassword({ email: this.email.trim() }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message;
        this.debugToken = response.resetToken ?? null;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error?.message ?? 'No fue posible procesar la solicitud.';
      }
    });
  }
}
