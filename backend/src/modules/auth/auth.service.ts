import { randomBytes } from "node:crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { loadEnv } from "../../config/env";
import type {
  AuthToken,
  AuthUser,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  ResetPasswordInput,
  ResetPasswordResult,
} from "./auth.types";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super("Invalid reset token");
  }
}

export class ExpiredResetTokenError extends Error {
  constructor() {
    super("Expired reset token");
  }
}

interface ResetTokenEntry {
  email: string;
  expiresAt: number;
  used: boolean;
}

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

export class AuthService {
  private readonly resetTokens = new Map<string, ResetTokenEntry>();
  private readonly runtimePasswordByEmail = new Map<string, string>();

  login(input: LoginInput): AuthToken {
    const env = loadEnv();
    const normalizedEmail = input.email.trim().toLowerCase();
    const expectedEmail = env.seedUser.trim().toLowerCase();
    const expectedPassword = this.runtimePasswordByEmail.get(expectedEmail) ?? env.seedPass;

    if (normalizedEmail !== expectedEmail || input.password !== expectedPassword) {
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

  requestPasswordReset(input: ForgotPasswordInput): ForgotPasswordResult {
    const env = loadEnv();
    const normalizedEmail = input.email.trim().toLowerCase();
    const expectedEmail = env.seedUser.trim().toLowerCase();

    if (normalizedEmail !== expectedEmail) {
      return {
        message: "If the account exists, a recovery token has been generated.",
      };
    }

    const token = randomBytes(24).toString("hex");
    this.resetTokens.set(token, {
      email: expectedEmail,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
      used: false,
    });

    return {
      message: "If the account exists, a recovery token has been generated.",
      resetToken: env.nodeEnv === "production" ? undefined : token,
    };
  }

  resetPassword(input: ResetPasswordInput): ResetPasswordResult {
    const token = input.token.trim();
    const newPassword = input.newPassword;

    if (!token) {
      throw new InvalidResetTokenError();
    }

    const tokenEntry = this.resetTokens.get(token);
    if (!tokenEntry || tokenEntry.used) {
      throw new InvalidResetTokenError();
    }

    if (tokenEntry.expiresAt < Date.now()) {
      this.resetTokens.delete(token);
      throw new ExpiredResetTokenError();
    }

    if (newPassword.length < 8) {
      throw new Error("Password must have at least 8 characters");
    }

    this.runtimePasswordByEmail.set(tokenEntry.email, newPassword);
    tokenEntry.used = true;
    this.resetTokens.set(token, tokenEntry);

    return {
      message: "Password updated successfully.",
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
