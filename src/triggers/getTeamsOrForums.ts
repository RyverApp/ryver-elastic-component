import { SimpleRyverAPIRequest } from '../api';
import { createAuth } from '../common';
const messages = require('elastic-node').messages;

exports.process = processTrigger;

function processTrigger(msg, cfg) {
    const org = cfg.org;
    const entityType = cfg.entityType;
    const auth = createAuth(cfg);

    if(!entityType) {
        throw new Error('Type field is required');
    }

    console.log('Fetching teams or forums...');
    new SimpleRyverAPIRequest(org, auth)
        .get(`${entityType}`)
        .then(results => {
            return messages.newMessageWithBody({ results });
        });
}
