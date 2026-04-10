"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnithIntegrationModule = createUnithIntegrationModule;
const unith_client_mock_1 = require("./unith-client.mock");
const unith_service_1 = require("./unith.service");
function createUnithIntegrationModule() {
    const client = new unith_client_mock_1.MockUnithClient();
    const service = new unith_service_1.UnithService(client);
    return {
        name: "integrations.unith",
        client,
        service,
        mode: "mock",
    };
}
