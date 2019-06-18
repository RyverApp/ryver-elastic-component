import { SimpleRyverAPIRequest } from '../api';
import { createAuth, getResource } from '../common';
const messages = require('elastic-node').messages;

exports.process = processAction;

function processAction(msg, cfg) {
    const org = cfg.org;
    const entityType = msg.body.type || cfg.entityType;
    const auth = createAuth(cfg);

    if (!entityType) {
        throw new Error('Type field is required');
    }
    
    console.log('Fetching teams or forums...');
    const resource = getResource(entityType);
    return new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}`)
        .then(res => {
            return messages.newMessageWithBody({
                id: res.id,
                nickname: res.nickname,
                name: res.name,
                descriptor: res.descriptor,
                description: res.description
            });
        });
}
