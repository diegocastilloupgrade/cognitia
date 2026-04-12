export interface ExecutionTask {
  id: string;
  sessionId: string;
  status: "pending" | "running" | "done";
}

export interface StartExecutionInput {
  sessionId: string;
}

export interface ItemTimingConfig {
  itemCode: string;
  durationSeconds: number;
  silenceThresholdSeconds: number;
}

export interface ItemTimingState {
  sessionId: number;
  itemCode: string;
  startedAt: string;
  durationSeconds: number;
  silenceThresholdSeconds: number;
  silenceEvents: Array<{
    occurredAt: string;
    type: "FIRST_SILENCE" | "SECOND_SILENCE";
  }>;
  completed: boolean;
}

export interface RuntimeSessionState {
  sessionId: number;
  status: "IN_PROGRESS" | "COMPLETED";
  activeItemCode: string | null;
  itemTimingStates: ItemTimingState[];
}
