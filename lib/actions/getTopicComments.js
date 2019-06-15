"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
var messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getTopicModel = common_1.getTopicModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const topicId = message.topicId || cfg.topic;
    if (!topicId) {
        throw new Error('Topic is required');
    }
    const auth = common_1.createAuth(cfg);
    console.log(`Fetching topic comments...`);
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`postComments`, { '$format': 'json', '$filter': `post/id eq ${topicId}` })
        .then(res => {
        const comments = res.map(comment => ({
            id: comment.id,
            comment: comment.comment,
            createDate: comment.createDate,
            userCreatorId: comment.createUser.id
        }));
        return messages.newMessageWithBody({ comments });
    })
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=getTopicComments.js.map