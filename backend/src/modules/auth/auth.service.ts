import jwt, { JwtPayload } from "jsonwebtoken";
import { loadEnv } from "../../config/env";
import type { AuthToken, AuthUser, LoginInput } from "./auth.types";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
  }
}

export class AuthService {
  login(input: LoginInput): AuthToken {
    const env = loadEnv();
    const normalizedEmail = input.email.trim().toLowerCase();
    const expectedEmail = env.seedUser.trim().toLowerCase();

    if (normalizedEmail !== expectedEmail || input.password !== env.seedPass) {
      throw new InvalidCredentialsError();
    }

    const accessToken = jwt.sign(
      {
        email: expectedEmail,
        role: "clinician",
      },
      env.jwtSecret,
      {
        subject: "user-1",
        expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
      },
    );

    const decoded = jwt.decode(accessToken) as JwtPayload | null;
    const expiresInSeconds =
      typeof decoded?.exp === "number" && typeof decoded.iat === "number"
        ? decoded.exp - decoded.iat
        : 8 * 60 * 60;

    return {
      accessToken,
      expiresInSeconds,
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
