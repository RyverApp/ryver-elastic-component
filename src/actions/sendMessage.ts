import { SimpleRyverAPIRequest } from '../api';
import { getEntityTypeModel, getEntityModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getEntityTypeModel = getEntityTypeModel;
exports.getEntityModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const body = message.body;

    if (!cfg.type) {
        throw new Error('Type is required');
    }

    if (!cfg.entityId) {
        throw new Error('Location is required');
    }

    if (!body) {
        throw new Error('Message body is required');
    }

    const title = message.title;
    const avatar = message.avatar;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);

    console.log('Creating a chat message...');
    const data: { [key: string]: any } = {
        body,
        createSource: {
            displayName: title
        }
    };

    if (avatar) {
        data.createSource.avatar = avatar;
    }

    return new SimpleRyverAPIRequest(org, auth)
        .post(`${resource}(${cfg.entityId})/Chat.PostMessage()`, {}, data)
        .then(res => (messages.newMessageWithBody({
            title,
            message: body,
            messageId: res.id
        })))
        .catch(err => { throw err; });
}
