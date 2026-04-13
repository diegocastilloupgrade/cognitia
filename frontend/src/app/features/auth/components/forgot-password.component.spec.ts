import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['forgotPassword']);

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('solicita recuperación y muestra token en respuesta', () => {
    authService.forgotPassword.and.returnValue(
      of({ message: 'Si el correo existe recibirá instrucciones.', resetToken: 'token-dev' })
    );

    component.email = 'clinician@cognitia.local';
    component.submit();

    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'clinician@cognitia.local' });
    expect(component.successMessage).toContain('instrucciones');
    expect(component.debugToken).toBe('token-dev');
    expect(component.loading).toBeFalse();
  });

  it('muestra error cuando backend responde fallo', () => {
    authService.forgotPassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'error interno' } }))
    );

    component.email = 'clinician@cognitia.local';
    component.submit();

    expect(component.errorMessage).toBe('error interno');
    expect(component.loading).toBeFalse();
  });
});
