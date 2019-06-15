"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getEntityTypeModel = common_1.getEntityTypeModel;
exports.getEntityModel = common_1.getEntityModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const body = message.body;
    if (!cfg.type) {
        throw new Error('Type is required');
    }
    if (!cfg.entityId) {
        throw new Error('Location is required');
    }
    if (!body) {
        throw new Error('Message body is required');
    }
    const title = message.title;
    const avatar = message.avatar;
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(cfg.type);
    console.log('Creating a chat message...');
    const data = {
        body,
        createSource: {
            displayName: title
        }
    };
    if (avatar) {
        data.createSource.avatar = avatar;
    }
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`${resource}(${cfg.entityId})/Chat.PostMessage()`, {}, data)
        .then(res => (messages.newMessageWithBody({
        title,
        message: body,
        messageId: res.id
    })))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=sendMessage.js.map