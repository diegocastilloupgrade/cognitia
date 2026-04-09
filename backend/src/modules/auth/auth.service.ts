import type { AuthToken, AuthUser, LoginInput } from "./auth.types";

export class AuthService {
  login(input: LoginInput): AuthToken {
    return {
      accessToken: `mock-token-for-${input.email}`,
      expiresInSeconds: 3600,
    };
  }

  me(): AuthUser {
    return {
      id: "user-1",
      email: "demo@cognitia.local",
      role: "clinician",
    };
  }
}
