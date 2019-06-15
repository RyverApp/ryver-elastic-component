"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getChatModel = common_1.getEntityModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const entityId = message.entityId || cfg.entityId;
    if (!cfg.type) {
        throw new Error('Type is required');
    }
    if (!entityId) {
        throw new Error('Location is required');
    }
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(cfg.type);
    console.log('Fetching topics...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Post.Stream(archived=false)`, { '$format': 'json' })
        .then(res => {
        const topics = res.map(topic => ({
            id: topic.id,
            subject: topic.subject,
            body: topic.body,
            comments: topic.commentsCount
        }));
        return messages.newMessageWithBody({ topics });
    })
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=getTopics.js.map