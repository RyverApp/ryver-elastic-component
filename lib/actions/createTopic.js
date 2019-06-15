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
    const body = message.body;
    const subject = message.subject;
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(cfg.type);
    const postType = common_1.getPostType(resource);
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
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`posts`, {}, data)
        .then(res => (messages.newMessageWithBody({
        id: res.id,
        subject,
        message: body
    })))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=createTopic.js.map