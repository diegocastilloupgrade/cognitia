import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token = '';
  newPassword = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.loading || !this.token.trim() || !this.newPassword.trim()) {
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService
      .resetPassword({ token: this.token.trim(), newPassword: this.newPassword.trim() })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message;
          void this.router.navigate(['/auth/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = error.error?.message ?? 'No fue posible actualizar la contraseña.';
        }
      });
  }
}
