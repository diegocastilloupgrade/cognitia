import { ResultsService } from "./results.service";
import type { CreateResultInput } from "./results.types";

export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  listBySession(sessionId: number) {
    return this.resultsService.listBySession(sessionId);
  }

  create(input: CreateResultInput) {
    return this.resultsService.create(input);
  }
}
