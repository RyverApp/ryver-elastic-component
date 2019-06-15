import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getTopicModel, createAuth } from '../common';
var messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getTopicModel = getTopicModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const topicId = message.topicId || cfg.topic;

    if (!topicId) {
        throw new Error('Topic is required');
    }

    const auth = createAuth(cfg);
    console.log(`Fetching topic comments...`);
    return new SimpleRyverAPIRequest(org, auth)
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
