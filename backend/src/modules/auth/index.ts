import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService, InvalidCredentialsError } from "./auth.service";

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
