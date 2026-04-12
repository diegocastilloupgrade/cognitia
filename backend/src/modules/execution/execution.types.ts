import type { ItemCode, ItemResultDataByCode } from "../results/results.types";

export interface ExecutionTask {
  id: string;
  sessionId: string;
  status: "pending" | "running" | "done";
}

export interface StartExecutionInput {
  sessionId: string;
}

export interface ItemTimingConfig {
  itemCode: ItemCode;
  durationSeconds: number;
  silenceThresholdSeconds: number;
}

export interface ItemTimingState {
  sessionId: number;
  itemCode: ItemCode;
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
  activeItemCode: ItemCode | null;
  itemTimingStates: ItemTimingState[];
}

export interface FinalizeItemRequest<TCode extends ItemCode = ItemCode> {
  resultData?: ItemResultDataByCode[TCode];
}

export interface FinalizeItemResponse {
  sessionId: number;
  completedItem: ItemTimingState;
  runtimeStatus: "IN_PROGRESS" | "COMPLETED";
  activeItem: {
    itemCode: ItemCode;
    startedAt: string;
    durationSeconds: number;
    silenceThresholdSeconds: number;
  } | null;
}
