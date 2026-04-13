import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loadEnv } from "../../config/env";

const BEARER_PREFIX = "Bearer ";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header("authorization");

  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    jwt.verify(token, loadEnv().jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
