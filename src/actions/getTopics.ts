import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getType } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getChatModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getType(cfg.type);

    console.log('Fetching topics...');
    return new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Post.Stream(archived=false)`, { '$format': 'json' })
        .then(res => {
            const topics = res.map(topic => ({
                id: topic.id,
                subject: topic.subject,
                body: topic.body,
                comments: topic.commentsCount
            }));
            
            return messages.newMessageWithBody({ topics });
        });
}
