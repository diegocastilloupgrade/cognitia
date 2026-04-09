import { ExecutionController } from "./execution.controller";
import { ExecutionService } from "./execution.service";

export function createExecutionModule() {
  const service = new ExecutionService();
  const controller = new ExecutionController(service);

  return {
    name: "execution",
    service,
    controller,
  };
}

export type ExecutionModule = ReturnType<typeof createExecutionModule>;
