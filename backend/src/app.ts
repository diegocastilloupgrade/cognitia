import cors from "cors";
import express from "express";
import { apiRouter } from "./modules";
import type { Router } from "express";

interface CreateAppOptions {
  router?: Router;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const router = options.router ?? apiRouter;

  app.use(cors());
  app.use(express.json());
  app.use("/api", router);

  return app;
}