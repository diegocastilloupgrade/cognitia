import { ResultsService } from "./results.service";
import type { AnyCreateResultInput } from "./results.types";

export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  listBySession(sessionId: number) {
    return this.resultsService.listBySession(sessionId);
  }

  create(input: AnyCreateResultInput) {
    return this.resultsService.create(input);
  }
}
