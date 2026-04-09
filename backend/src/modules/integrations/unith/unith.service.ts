import type { UnithClient } from "./unith-client.interface";
import type { UnithResultPayload, UnithSessionPayload } from "./unith.types";

export class UnithService {
  constructor(private readonly unithClient: UnithClient) {}

  syncSession(payload: UnithSessionPayload) {
    return this.unithClient.sendSession(payload);
  }

  syncResult(payload: UnithResultPayload) {
    return this.unithClient.sendResult(payload);
  }
}
