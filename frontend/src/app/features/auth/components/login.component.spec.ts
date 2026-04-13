import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, AuthToken } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'saveToken']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('muestra estado cargando durante la petición de login', () => {
    const loginResponse$ = new Subject<AuthToken>();
    authService.login.and.returnValue(loginResponse$.asObservable());

    component.email = 'clinician@cognitia.local';
    component.password = 'test-pass';

    component.login();

    expect(component.loading).toBeTrue();
    expect(component.errorState).toBeNull();

    loginResponse$.next({ accessToken: 'jwt', expiresInSeconds: 3600 });
    loginResponse$.complete();

    expect(component.loading).toBeFalse();
    expect(authService.saveToken).toHaveBeenCalledWith('jwt');
  });

  it('muestra error de credenciales cuando backend responde 401', () => {
    authService.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    component.email = 'clinician@cognitia.local';
    component.password = 'wrong-pass';

    component.login();

    expect(component.loading).toBeFalse();
    expect(component.errorState).toBe('credentials');
  });

  it('muestra error de red cuando falla la conexión', () => {
    authService.login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    component.email = 'clinician@cognitia.local';
    component.password = 'test-pass';

    component.login();

    expect(component.loading).toBeFalse();
    expect(component.errorState).toBe('network');
  });
});
