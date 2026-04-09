import { ExecutionService } from "./execution.service";
import type { StartExecutionInput } from "./execution.types";

export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  list() {
    return this.executionService.list();
  }

  start(input: StartExecutionInput) {
    return this.executionService.start(input);
  }
}
