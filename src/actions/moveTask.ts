import { SimpleRyverAPIRequest } from '../api';
import { createAuth, getTeamOrForumModel, getEntityModel, getCategoryModel, getTaskModel } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.getTaskModel = getTaskModel;
exports.process = processAction;

export function processAction(msg, cfg) {
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

    const auth = createAuth(cfg);
    const toPosition = cfg.toPosition || '0';

    console.log('Moving task...');
    return new SimpleRyverAPIRequest(org, auth)
        .post(`tasks(${taskId})/Task.Move(position=${toPosition}, category=${toCategoryId})`, { '$expand': 'createUser,modifyUser,assignees', '$select': 'id,__descriptor,__subscribed,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,latestComments,tags,createUser/id,createUser/__descriptor,modifyUser/id,modifyUser/__descriptor,assignees/id,assignees/__descriptor,embeds,extras' }, {})
        .then(res => messages.newMessageWithBody({
            ...res,
            categoryId: toCategoryId
        }))
        .catch(err => { throw err; });
}
