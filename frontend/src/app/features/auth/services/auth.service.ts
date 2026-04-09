import { Injectable } from '@angular/core';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  expiresInSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  login(payload: LoginPayload) {
    console.log('AuthService.login:', payload);
    return Promise.resolve({
      accessToken: `token-${payload.email}`,
      expiresInSeconds: 3600
    });
  }
}
