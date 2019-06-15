"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elastic-node').messages;
exports.process = processTrigger;
function processTrigger(msg, cfg) {
    const org = cfg.org;
    const entityType = msg.body.type || cfg.entityType;
    const auth = common_1.createAuth(cfg);
    if (!entityType) {
        throw new Error('Type field is required');
    }
    console.log('Fetching teams or forums...');
    const resource = common_1.getResource(entityType);
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}`)
        .then(res => {
        return messages.newMessageWithBody({
            id: res.id,
            nickname: res.nickname,
            name: res.name,
            descriptor: res.descriptor,
            description: res.description
        });
    });
}
//# sourceMappingURL=getTeamsOrForums.js.map