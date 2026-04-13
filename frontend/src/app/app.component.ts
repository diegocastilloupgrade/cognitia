import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cognitia Frontend';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.hasValidSession();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
