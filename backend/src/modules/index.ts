import { RequestHandler, Router } from "express";
import { authRouter } from "./auth";
import { executionRouter } from "./execution";
import { patientsRouter } from "./patients";
import { resultsRouter } from "./results";
import { sessionsRouter } from "./sessions";

export function createApiRouter(privateMiddleware?: RequestHandler): Router {
  const apiRouter = Router();

  apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  apiRouter.use("/auth", authRouter);

  if (privateMiddleware) {
    apiRouter.use("/patients", privateMiddleware, patientsRouter);
    apiRouter.use("/sessions", privateMiddleware, sessionsRouter);
    apiRouter.use("/results", privateMiddleware, resultsRouter);
    apiRouter.use("/execution", privateMiddleware, executionRouter);
  } else {
    apiRouter.use("/patients", patientsRouter);
    apiRouter.use("/sessions", sessionsRouter);
    apiRouter.use("/results", resultsRouter);
    apiRouter.use("/execution", executionRouter);
  }

  return apiRouter;
}

export const apiRouter = createApiRouter();
