import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../features/auth/services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['hasValidSession']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('permite acceso con token válido', () => {
    authService.hasValidSession.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBeTrue();
  });

  it('redirige a login sin token', () => {
    authService.hasValidSession.and.returnValue(false);

    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('redirige a login con token expirado', () => {
    authService.hasValidSession.and.returnValue(false);

    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});
