import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type LoginErrorState = 'credentials' | 'network' | null;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorState: LoginErrorState = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorState = null;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.accessToken);
        this.loading = false;
        void this.router.navigate(['/patients']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorState = error.status === 401 ? 'credentials' : 'network';
      }
    });
  }
}
