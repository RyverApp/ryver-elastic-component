import { SimpleRyverAPIRequest } from '../api';
import { getTeamOrForumModel, getEntityModel, getCategoryModel, getUserModel, createAuth, getResource } from '../common';
const messages = require('elasticio-node').messages;

exports.getTeamOrForumModel = getTeamOrForumModel;
exports.getEntityModel = getEntityModel;
exports.getCategoryModel = getCategoryModel;
exports.getUserModel = getUserModel;
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
                .post(`tasks`, { '$select': 'id,__descriptor,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,tags,board%2Fid,board%2F__descriptor,category%2Fid,category%2F__descriptor,category%2FcategoryType,parent%2Fid,createUser%2Fid,createUser%2F__descriptor,modifyUser%2Fid,modifyUser%2F__descriptor,assignees%2Fid,assignees%2F__descriptor,attachments%2Fid,attachments%2Ftype,attachments%2Furl,attachments%2FcreateDate,attachments%2FfileSize,attachments%2FfileName,attachments%2FshowPreview,attachments%2Fembeds,attachments%2FrecordType,subTasks%2Fid,subTasks%2Fsubject,subTasks%2FcompleteDate,subTasks%2Fposition,embeds,extras,__reactions,__subscribed', '$expand': 'board,category,parent,createUser,modifyUser,assignees,attachments,subTasks' }, data);
        })
        .then(res => messages.newMessageWithBody(res))
        .catch(err => { throw err; });
}
