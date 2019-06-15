import { SimpleRyverAPIRequest } from '../api';
import { createAuth, getTeamOrForumModel, getEntityModel, getTopicModel } from '../common';
const messages = require('elasticio-node').messages;

exports.process = processAction;
exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getTopicModel = getTopicModel;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;

    if (!cfg.topicId) {
        throw new Error('Topic is required');
    }

    if (!message.comment) {
        throw new Error('Comment is required');
    }

    const auth = createAuth(cfg);
    console.log('Creating topic comment...');
    return new SimpleRyverAPIRequest(org, auth)
        .post(`posts(id=${cfg.topicId})/comments`, {}, { comment: message.comment })
        .then(res => messages.newMessageWithBody({
            id: res.id,
            comment: message.comment
        }))
        .catch(err => { throw err; });
}
