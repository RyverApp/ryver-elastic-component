"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.process = processAction;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getCategoryModel = common_1.getCategoryModel;
exports.getTaskModel = common_1.getTaskModel;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    if (!cfg.taskId) {
        throw new Error('Task is required');
    }
    if (!message.comment) {
        throw new Error('Comment is required');
    }
    const auth = common_1.createAuth(cfg);
    const data = {
        comment: message.comment,
        task: {
            id: cfg.taskId
        }
    };
    console.log('Creating task comment...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`taskComments`, {}, data)
        .then(res => messages.newMessageWithBody({
        id: res.id,
        comment: message.comment
    }))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=createTaskComment.js.map