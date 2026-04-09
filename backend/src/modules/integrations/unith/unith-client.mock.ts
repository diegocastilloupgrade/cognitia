import type { UnithClient } from "./unith-client.interface";
import type { UnithAck, UnithResultPayload, UnithSessionPayload } from "./unith.types";

export class MockUnithClient implements UnithClient {
  async sendSession(payload: UnithSessionPayload): Promise<UnithAck> {
    return {
      accepted: true,
      message: `Mock sendSession accepted for ${payload.externalSessionId}`,
    };
  }

  async sendResult(payload: UnithResultPayload): Promise<UnithAck> {
    return {
      accepted: true,
      message: `Mock sendResult accepted for ${payload.externalSessionId}`,
    };
  }
}
