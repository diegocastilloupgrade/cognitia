import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../services/auth.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['resetPassword']);

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('restablece contraseña y redirige a login', () => {
    authService.resetPassword.and.returnValue(of({ message: 'Contraseña actualizada.' }));

    component.token = 'reset-token';
    component.newPassword = 'new-pass';
    component.submit();

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'reset-token',
      newPassword: 'new-pass'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(component.loading).toBeFalse();
  });

  it('muestra error cuando token es inválido', () => {
    authService.resetPassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Token inválido' } }))
    );

    component.token = 'invalid';
    component.newPassword = 'new-pass';
    component.submit();

    expect(component.errorMessage).toBe('Token inválido');
    expect(component.loading).toBeFalse();
  });
});
