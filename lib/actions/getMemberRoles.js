"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const entityId = message.entityId || cfg.entityId;
    if (!cfg.type) {
        throw new Error('Type is required');
    }
    if (!entityId) {
        throw new Error('Location is required');
    }
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(cfg.type);
    console.log('Fetching members and roles...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
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
exports.processAction = processAction;
//# sourceMappingURL=getMemberRoles.js.map