"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getCategoryModel = common_1.getCategoryModel;
exports.getTaskModel = common_1.getTaskModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const taskId = message.taskId || cfg.taskId;
    const toCategoryId = message.toCategoryId || cfg.toCategoryId;
    if (!taskId) {
        throw new Error('Task is required');
    }
    if (!toCategoryId) {
        throw new Error('Destination category is required');
    }
    const auth = common_1.createAuth(cfg);
    const toPosition = cfg.toPosition || '0';
    console.log('Moving task...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`tasks(${taskId})/Task.Move(position=${toPosition}, category=${toCategoryId})`, { '$expand': 'createUser,modifyUser,assignees', '$select': 'id,__descriptor,__subscribed,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,latestComments,tags,createUser%2Fid,createUser%2F__descriptor,modifyUser%2Fid,modifyUser%2F__descriptor,assignees%2Fid,assignees%2F__descriptor,embeds,extras' }, {})
        .then(res => messages.newMessageWithBody(Object.assign({}, res, { categoryId: toCategoryId })))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=moveTask.js.map