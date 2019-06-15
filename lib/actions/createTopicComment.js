"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.process = processAction;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getTopicModel = common_1.getTopicModel;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    if (!cfg.topicId) {
        throw new Error('Topic is required');
    }
    if (!message.comment) {
        throw new Error('Comment is required');
    }
    const auth = common_1.createAuth(cfg);
    console.log('Creating topic comment...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`posts(id=${cfg.topicId})/comments`, {}, { comment: message.comment })
        .then(res => messages.newMessageWithBody({
        id: res.id,
        comment: message.comment
    }))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=createTopicComment.js.map