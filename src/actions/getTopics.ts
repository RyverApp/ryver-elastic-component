import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getChatModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const entityId = message.entityId || cfg.entityId;

    if (!cfg.type) {
        throw new Error('Type is required');
    }

    if (!entityId) {
        throw new Error('Location is required');
    }

    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);

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
        })
        .catch(err => { throw err; });
}
