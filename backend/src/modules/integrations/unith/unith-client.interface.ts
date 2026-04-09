import type { UnithAck, UnithResultPayload, UnithSessionPayload } from "./unith.types";

export interface UnithClient {
  sendSession(payload: UnithSessionPayload): Promise<UnithAck>;
  sendResult(payload: UnithResultPayload): Promise<UnithAck>;
}
