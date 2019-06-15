import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getResource, getPostType } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const body = message.body;
    const subject = message.subject;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);
    const postType = getPostType(resource);

    if (!subject) {
        throw new Error('Subject is required');
    }

    console.log('Creating a topic...');   
    const data = {
        subject,
        body,
        outAssociations: {
            results: [
                {
                    inSecured: true,
                    inType: `Entity.${postType}`,
                    inId: parseInt(cfg.entityId, 10)
                }
            ]
        },
        recordType: 'note'
    };

    return new SimpleRyverAPIRequest(org, auth)
        .post(`posts`, {}, data)
        .then(res => (messages.newMessageWithBody({
            id: res.id,
            subject,
            message: body
        })))
        .catch(err => { throw err; });
}
