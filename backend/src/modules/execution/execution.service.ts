import type { ExecutionTask, StartExecutionInput } from "./execution.types";

export class ExecutionService {
  private readonly tasks: ExecutionTask[] = [];

  list(): ExecutionTask[] {
    return this.tasks;
  }

  start(input: StartExecutionInput): ExecutionTask {
    const task: ExecutionTask = {
      id: `execution-${this.tasks.length + 1}`,
      sessionId: input.sessionId,
      status: "pending",
    };

    this.tasks.push(task);
    return task;
  }
}
