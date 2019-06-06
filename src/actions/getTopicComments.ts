import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getType } from '../common';
var messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getTopicModel = getTopicModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;

    console.log(`Fetching topic comments...`);
    return new SimpleRyverAPIRequest(org, auth)
        .get(`postComments`, { '$format': 'json', '$filter': `post/id eq ${cfg.topic}` })
        .then(res => {
            const comments = res.map(comment => ({
                id: comment.id,
                comment: comment.comment,
                createDate: comment.createDate,
                userCreatorId: comment.createUser.id
            }));
            return messages.newMessageWithBody({ comments });
        });
}

export function getTopicModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getType(cfg.type);

    new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Post.Stream(archived=false)`, { '$format': 'json' })
        .then(res => {
            const byId = res.reduce((byId, topic) => (
                byId[topic.id] = topic.subject,
                byId
            ), {});
            cb(null, byId);
        });
}
