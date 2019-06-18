import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getEntityTypeModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityTypeModel = getEntityTypeModel;
exports.getEntityModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const message = msg.body;
    const type = message.type || cfg.type;
    const entityId = message.id || cfg.entityId;

    if (!type) {
        throw new Error('Type is required');
    }

    if (!entityId) {
        throw new Error('Forum, Team, or User is required');
    }

    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(type);
    let skip = message.skip && parseInt(message.skip, 10);

    if (!skip || isNaN(skip)) {
        skip = 0;
    }

    console.log('Fetching chat history...');
    return new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${entityId})/Chat.History()`, { '$format': 'json', '$skip': 0 })
        .then(res => {
            const history = res.map(chat => ({
                id: chat.id,
                date: chat.when,
                from: chat.from.__descriptor,
                to: chat.to.__descriptor,
                body: chat.body,
                type: chat.messageType
            }));

            return messages.newMessageWithBody({ history });
        });
}
