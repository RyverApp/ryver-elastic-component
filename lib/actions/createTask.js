"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.getTeamOrForumModel = common_1.getTeamOrForumModel;
exports.getEntityModel = common_1.getEntityModel;
exports.getCategoryModel = common_1.getCategoryModel;
exports.getMemberModel = common_1.getMemberModel;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    if (!cfg.type) {
        throw new Error('Type is required');
    }
    if (!cfg.entityId) {
        throw new Error('Location is required');
    }
    const assigneeIds = cfg.assignees ? cfg.assignees.split(',') : message.assignees ? message.assignees.split(',') : [];
    const auth = common_1.createAuth(cfg);
    const resource = common_1.getResource(cfg.type);
    console.log('Creating a task...');
    return new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/board`, { '$select': 'id' })
        .then(res => {
        const data = {
            subject: message.subject,
            body: message.body,
            assignees: {
                results: assigneeIds.map(id => ({ id: parseInt(id.trim(), 10) }))
            },
            subTasks: {
                results: message.checklist ? message.checklist.split(",").map(subject => ({ subject: subject.trim() })) : []
            },
            tags: message.tags ? message.tags.split(",").map(tag => tag.trim()) : [],
            board: {
                id: res.id
            }
        };
        if (cfg.category) {
            data.category = { id: parseInt(cfg.category, 10) };
        }
        if (cfg.completed) {
            data.completeDate = new Date().toISOString();
        }
        return new api_1.SimpleRyverAPIRequest(org, auth)
            .post(`tasks`, { '$expand': 'board,category,createUser,modifyUser,assignees,attachments,subTasks', '$select': 'id,__descriptor,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,tags,board/id,board/__descriptor,category/id,category/__descriptor,category/categoryType,createUser/id,createUser/__descriptor,modifyUser/id,modifyUser/__descriptor,assignees/id,assignees/__descriptor,attachments/id,attachments/type,attachments/url,attachments/createDate,attachments/fileSize,attachments/fileName,attachments/showPreview,attachments/embeds,attachments/recordType,subTasks/id,subTasks/subject,subTasks/completeDate,subTasks/position,embeds,extras,__reactions,__subscribed' }, data);
    })
        .then(res => messages.newMessageWithBody(res))
        .catch(err => { throw err; });
}
exports.processAction = processAction;
//# sourceMappingURL=createTask.js.map