import { Router } from "express";
import { AuthController } from "./auth.controller";
import {
  AuthService,
  ExpiredResetTokenError,
  InvalidCredentialsError,
  InvalidResetTokenError,
} from "./auth.service";

export const authRouter = Router();
const authController = new AuthController(new AuthService());

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  try {
    const token = authController.login({ email, password });
    res.status(200).json(token);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    throw error;
  }
});

authRouter.post("/forgot-password", (req, res) => {
  const { email } = req.body ?? {};

  if (typeof email !== "string" || !email.trim()) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  const response = authController.forgotPassword({ email });
  res.status(202).json(response);
});

authRouter.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body ?? {};

  if (typeof token !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ message: "token and newPassword are required" });
    return;
  }

  try {
    const result = authController.resetPassword({ token, newPassword });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidResetTokenError || error instanceof ExpiredResetTokenError) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message === "Password must have at least 8 characters") {
      res.status(400).json({ message: error.message });
      return;
    }

    throw error;
  }
});
