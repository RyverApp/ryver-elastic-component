"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityTypeModel = common_1.getEntityTypeModel;
exports.getEntityModel = common_1.getEntityModel;
exports.process = processTrigger;
function processTrigger(msg, cfg) {
    const message = msg.body;
    const type = message.type || cfg.type;
    const entityId = message.id || cfg.entityId;
    if (!type) {
        throw new Error('Type is required');
    }
    if (!entityId) {
        throw new Error('Forum, Team, or User is required');
    }
    const org = cfg.org;
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(type);
    let skip = message.skip && parseInt(message.skip, 10);
    if (!skip || isNaN(skip)) {
        skip = 0;
    }
    console.log('Fetching chat history...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${entityId})/Chat.History()`, { '$format': 'json', '$skip': 0 })
        .then(res => {
        const history = res.map(chat => ({
            id: chat.id,
            date: chat.when,
            from: chat.from.__descriptor,
            to: chat.to.__descriptor,
            body: chat.body,
            type: chat.messageType
        }));
        return messages.newMessageWithBody({ history });
    });
}
exports.processTrigger = processTrigger;
//# sourceMappingURL=getChatHistory.js.map