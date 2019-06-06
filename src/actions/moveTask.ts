import { SimpleRyverAPIRequest } from '../api';
import { createAuth, getTeamOrForumModel, getEntityModel, getCategoryModel } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.getTaskModel = getTaskModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const taskId = cfg.taskId;
    const toPosition = cfg.toPosition || '0';
    const toCategoryId = cfg.toCategoryId;

    if (!taskId) {
        throw new Error('Task is required');
    }

    if (!toCategoryId) {
        throw new Error('Destination category is required');
    }

    console.log('Moving task...');
    return new SimpleRyverAPIRequest(org, auth)
        .post(`tasks(${taskId})/Task.Move(position=${toPosition}, category=${toCategoryId})`, { '$expand': 'createUser,modifyUser,assignees', '$select': 'id,__descriptor,__subscribed,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,latestComments,tags,createUser%2Fid,createUser%2F__descriptor,modifyUser%2Fid,modifyUser%2F__descriptor,assignees%2Fid,assignees%2F__descriptor,embeds,extras' }, {})
        .then(res => messages.newMessageWithBody(res));
}

export function getTaskModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);

    new SimpleRyverAPIRequest(org, auth)
    .get(`taskCategories(${cfg.fromCategoryId})/tasks`)
    .then(res => {
        const byId = res.reduce((byId, task) => (
            byId[task.id] = task.subject,
            byId
        ), {});
        cb(null, byId);
    })
    .catch(cb);
}
