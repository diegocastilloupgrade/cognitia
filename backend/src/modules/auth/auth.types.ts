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
