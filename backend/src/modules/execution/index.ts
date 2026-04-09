import { Router } from "express";

export const executionRouter = Router();

executionRouter.get("/runtime", (_req, res) => {
  res.json({ status: "idle" });
});
