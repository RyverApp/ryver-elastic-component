import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getType, getPostType } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getType(cfg.type);

    console.log('Fetching members and roles...');
    return new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/members`, { '$select': 'id,roles,extras,__descriptor' })
        .then(res => {
            const members = res.map(member => {
                let role = '';

                if (member.roles[0].includes('ADMIN')) {
                    role = 'Admin';
                }

                if (member.roles[0].includes('MEMBER')) {
                    role = 'Member';
                }

                if (member.roles[0].includes('INVITE')) {
                    role = 'Member invite';
                }

                return {
                    id: member.id,
                    displayName: member.extras.displayName,
                    role
                };
            });

            return messages.newMessageWithBody({ members });
        });
}
