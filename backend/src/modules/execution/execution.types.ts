export interface ExecutionTask {
  id: string;
  sessionId: string;
  status: "pending" | "running" | "done";
}

export interface StartExecutionInput {
  sessionId: string;
}
