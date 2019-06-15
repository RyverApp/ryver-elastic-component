import { SimpleRyverAPIRequest } from '../api';
import { createAuth, getEntityModel, getCategoryModel, getTaskModel } from '../common';
const messages = require('elasticio-node').messages;

exports.process = processAction;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.getTaskModel = getTaskModel;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;

    if (!cfg.taskId) {
        throw new Error('Task is required');
    }

    if (!message.comment) {
        throw new Error('Comment is required');
    }

    const auth = createAuth(cfg);
    const data = {
        comment: message.comment,
        task: {
            id: cfg.taskId
        }
    };

    console.log('Creating task comment...');
    return new SimpleRyverAPIRequest(org, auth)
        .post(`taskComments`, {}, data)
        .then(res => messages.newMessageWithBody({
            id: res.id,
            comment: message.comment
        }))
        .catch(err => { throw err; });
}
