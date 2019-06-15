import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getCategoryModel, createAuth } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const message = msg.body;
    const categoryId = message.categoryId || cfg.category;

    if (!categoryId) {
        throw new Error('Category is required');
    }

    console.log('Fetching tasks...');
    return new SimpleRyverAPIRequest(org, auth)
        .get(`taskCategories(${cfg.category})/tasks`)
        .then(res => {
            const tasks = res.map(task => ({
                id: task.id,
                subject: task.subject,
                body: task.body
            }));

            return messages.newMessageWithBody({ tasks });
        })
        .catch(err => { throw err; });
}
