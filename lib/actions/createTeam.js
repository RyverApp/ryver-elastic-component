"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const common_1 = require("../common");
const messages = require('elasticio-node').messages;
exports.process = processAction;
function processAction(msg, cfg) {
    const org = cfg.org;
    const message = msg.body;
    const name = message.name && message.name.trim();
    if (!name) {
        throw new Error('Name is required');
    }
    const tabs = [];
    if (cfg.chatTab) {
        tabs.push('chat');
    }
    if (cfg.topicTab) {
        tabs.push('post');
    }
    if (cfg.taskTab) {
        tabs.push('task');
    }
    const data = {
        name,
        description: message.description || '',
        about: message.about || '',
        tabs,
        sharePosts: cfg.chat && cfg.sharePosts || false,
        shareTasks: cfg.chat && cfg.shareTasks || false
    };
    const nickname = message.nickname && message.nickname.replace(/\s+/, '');
    const auth = common_1.createAuth(cfg);
    if (nickname) {
        if (nickname < 2) {
            throw new Error('Nickname must be at least 2 characters');
        }
        else if (nickname > 24) {
            throw new Error('Nickname must be under 25 characters');
        }
        else {
            data.nickname = nickname;
        }
    }
    console.log('Creating team...');
    return nickname ? (new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`Name.IsValid(name='${nickname}')`, {}, {})
        .then(res => {
        if (!res || !res.valid) {
            throw new Error('Unable to verify. Try a different nickname or re-send.');
        }
        return new api_1.SimpleRyverAPIRequest(org, auth)
            .post(`workrooms/Workroom.Create()`, {}, data);
    })
        .then(res => messages.newMessageWithBody({
        id: res.id,
        name: res.name,
        nickname: res.nickname || '',
        description: res.description
    }))
        .catch(err => { throw err; })) : (new api_1.SimpleRyverAPIRequest(org, auth)
        .post(`workrooms/Workroom.Create()`, {}, data)
        .then(res => messages.newMessageWithBody({
        id: res.id,
        name: res.name,
        nickname: '',
        description: res.description
    }))
        .catch(err => { throw err; }));
}
exports.processAction = processAction;
//# sourceMappingURL=createTeam.js.map