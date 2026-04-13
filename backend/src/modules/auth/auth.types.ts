export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "clinician" | "viewer";
}

export interface AuthToken {
  accessToken: string;
  expiresInSeconds: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResult {
  message: string;
}
