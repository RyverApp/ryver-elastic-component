"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getCategoryModel = common_1.getCategoryModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const auth = common_1.createAuth(cfg);
    const message = msg.body;
    const categoryId = message.categoryId || cfg.category;
    if (!categoryId) {
        throw new Error('Category is required');
    }
    console.log('Fetching tasks...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
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
exports.processAction = processAction;
//# sourceMappingURL=getTasksFromCategory.js.map