import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getCategoryModel, getMemberModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.getMemberModel = getMemberModel;
exports.process = processAction;

export function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;

    if (!cfg.type) {
        throw new Error('Type is required');
    }

    if (!cfg.entityId) {
        throw new Error('Location is required');
    }

    const assigneeIds = cfg.assignees ? cfg.assignees.split(',') : message.assignees ? message.assignees.split(',') : [];
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);

    console.log('Creating a task...');
    new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/board`, { '$select': 'id' })
        .then(res => {
            const data: { [key: string]: any } = {
                subject: message.subject,
                body: message.body,
                assignees: assigneeIds.map(id => ({ id: parseInt(id.trim(), 10) })),
                subTasks: message.checklist ? message.checklist.split(",").map(subject => ({ subject: subject.trim() })) : [],
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

            return new SimpleRyverAPIRequest(org, auth)
                .post(`tasks`, { '$select': 'id,__descriptor,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,tags,board/id,board/__descriptor,category/id,category/__descriptor,category/categoryType,parent/id,createUser/id,createUser/__descriptor,modifyUser/id,modifyUser/__descriptor,assignees/id,assignees/__descriptor,attachments/id,attachments/type,attachments/url,attachments/createDate,attachments/fileSize,attachments/fileName,attachments/showPreview,attachments/embeds,attachments/recordType,subTasks/id,subTasks/subject,subTasks/completeDate,subTasks/position,embeds,extras,__reactions,__subscribed', '$expand': 'board,category,parent,createUser,modifyUser,assignees,attachments,subTasks' }, data);
        })
        .then(res => messages.newMessageWithBody(res))
        .catch(err => {
            console.log('err message=', err.value, 'status=', err.status, err.statusText);
            throw err;
        });
}
