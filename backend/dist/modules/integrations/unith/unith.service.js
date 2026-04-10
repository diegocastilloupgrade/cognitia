"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnithService = void 0;
class UnithService {
    constructor(unithClient) {
        this.unithClient = unithClient;
    }
    syncSession(payload) {
        return this.unithClient.sendSession(payload);
    }
    syncResult(payload) {
        return this.unithClient.sendResult(payload);
    }
}
exports.UnithService = UnithService;
