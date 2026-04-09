import { Router } from "express";
import { authRouter } from "./auth";
import { executionRouter } from "./execution";
import { patientsRouter } from "./patients";
import { resultsRouter } from "./results";
import { sessionsRouter } from "./sessions";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/results", resultsRouter);
apiRouter.use("/execution", executionRouter);
