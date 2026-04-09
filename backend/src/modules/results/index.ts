import { ResultsController } from "./results.controller";
import { ResultsService } from "./results.service";

export function createResultsModule() {
  const service = new ResultsService();
  const controller = new ResultsController(service);

  return {
    name: "results",
    service,
    controller,
  };
}

export type ResultsModule = ReturnType<typeof createResultsModule>;
