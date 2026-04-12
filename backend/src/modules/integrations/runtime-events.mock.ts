export interface MockSilenceRuntimeEvent {
  source: "MOCK";
  eventType: "SILENCE_DETECTED";
  sessionId: number;
  itemCode: string;
  occurredAt: string;
}

export interface MockSilenceEventEnvelope {
  event?: MockSilenceRuntimeEvent;
  level?: 1 | 2;
}

export function parseMockSilenceEvent(
  payload: unknown,
  expectedSessionId: number,
  expectedItemCode: string
): { isValid: boolean; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Invalid silence payload" };
  }

  const body = payload as MockSilenceEventEnvelope;
  if (!body.event) {
    return { isValid: true };
  }

  const { event } = body;
  const isValidEnvelope =
    event.source === "MOCK" &&
    event.eventType === "SILENCE_DETECTED" &&
    event.sessionId === expectedSessionId &&
    event.itemCode === expectedItemCode;

  if (!isValidEnvelope) {
    return { isValid: false, error: "Invalid mock silence event envelope" };
  }

  if (!event.occurredAt || Number.isNaN(Date.parse(event.occurredAt))) {
    return { isValid: false, error: "Invalid mock silence event timestamp" };
  }

  return { isValid: true };
}