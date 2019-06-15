import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
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
        })
        .catch(err => { throw err; });
}
