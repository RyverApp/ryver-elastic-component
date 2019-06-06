import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getEntityTypeModel, createAuth, getType } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityTypeModel = getEntityTypeModel;
exports.getEntityModel = getEntityModel;
exports.process = processTrigger;

export function processTrigger(msg, cfg) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getType(cfg.type);

    console.log('Fetching chat history...');
    return new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Chat.History()`, { '$format': 'json', '$top': 5 })
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
