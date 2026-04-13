import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBaseUrl } from '../../../core/api-config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  expiresInSeconds: number;
}

interface JwtPayload {
  exp?: number;
}

export const AUTH_TOKEN_STORAGE_KEY = 'cognitia_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${getApiBaseUrl()}/auth/login`, payload);
  }

  saveToken(accessToken: string): void {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  hasValidSession(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const payload = this.decodeJwtPayload(token);
    const expirationTimeSeconds = payload?.exp;

    if (!expirationTimeSeconds) {
      this.clearToken();
      return false;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const valid = expirationTimeSeconds > nowSeconds;

    if (!valid) {
      this.clearToken();
    }

    return valid;
  }

  logout(): void {
    this.clearToken();
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split('.');

    if (parts.length < 2) {
      return null;
    }

    try {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}
