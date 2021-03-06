"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const btoa_1 = __importDefault(require("btoa"));
function createAuth(cfg) {
    return cfg.user ? `Basic ${btoa_1.default(`${cfg.user}:${cfg.pass}`)}` : `Bearer ${cfg.token}`;
}
exports.createAuth = createAuth;
function getResource(type) {
    const resource = type && type.toLowerCase();
    if (resource === 'teams') {
        return 'workrooms';
    }
    return resource || '';
}
exports.getResource = getResource;
function getPostType(type) {
    if (type === 'forums') {
        return 'Forum';
    }
    else if (type === 'workrooms') {
        return 'Workroom';
    }
    return type;
}
exports.getPostType = getPostType;
function getTeamOrForumModel(cfg, cb) {
    const types = {
        'Forums': 'Forums',
        'Teams': 'Teams'
    };
    cb(null, types);
}
exports.getTeamOrForumModel = getTeamOrForumModel;
function getEntityTypeModel(cfg, cb) {
    const types = {
        'Forums': 'Forums',
        'Teams': 'Teams',
        'Users': 'Users'
    };
    cb(null, types);
}
exports.getEntityTypeModel = getEntityTypeModel;
function getEntityModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);
    if (!cfg.type) {
        console.log('Type is missing');
        cb(null, {});
        return;
    }
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(resource)
        .then(res => {
        let byId;
        if (resource !== 'users') {
            byId = res.reduce((byId, entity) => (byId[entity.id] = entity.name,
                byId), {});
        }
        else {
            byId = res.reduce((byId, entity) => {
                if (cfg.user !== entity.username) {
                    byId[entity.id] = entity.displayName;
                }
                return byId;
            }, {});
        }
        cb(null, byId);
    })
        .catch(cb);
}
exports.getEntityModel = getEntityModel;
function getMemberModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);
    if (!cfg.type) {
        console.log('Type is missing');
        cb(null, {});
        return;
    }
    if (!cfg.entityId) {
        console.log('Location is missing');
        cb(null, {});
        return;
    }
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/members`, { '$expand': 'member', '$select': 'member' })
        .then(res => {
        const byId = res.reduce((byId, entity) => (byId[entity.member.id] = entity.member.displayName,
            byId), {});
        cb(null, byId);
    })
        .catch(cb);
}
exports.getMemberModel = getMemberModel;
function getTopicModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);
    if (!cfg.type) {
        console.log('Type is missing');
        cb(null, {});
        return;
    }
    if (!cfg.entityId) {
        console.log('Location is missing');
        cb(null, {});
        return;
    }
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Post.Stream(archived=false)`, { '$format': 'json' })
        .then(res => {
        const byId = res.reduce((byId, topic) => (byId[topic.id] = topic.subject,
            byId), {});
        cb(null, byId);
    })
        .catch(cb);
}
exports.getTopicModel = getTopicModel;
function getCategoryModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);
    if (!cfg.type) {
        console.log('Type is missing');
        cb(null, {});
        return;
    }
    if (!cfg.entityId) {
        console.log('Location is missing');
        cb(null, {});
        return;
    }
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/board`, { '$select': 'id' })
        .then(res => (new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`taskBoards(${res.id})/categories`, { '$select': 'id,name' })))
        .then(res => {
        const byId = res.reduce((byId, category) => (byId[category.id] = category.name,
            byId), {});
        cb(null, byId);
    })
        .catch(cb);
}
exports.getCategoryModel = getCategoryModel;
function getTaskModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    if (!cfg.category) {
        console.log('Category is missing');
        cb(null, {});
        return;
    }
    new api_1.SimpleRyverAPIRequest(org, auth)
        .get(`taskCategories(${cfg.category})/tasks`)
        .then(res => {
        const byId = res.reduce((byId, task) => (byId[task.id] = task.subject,
            byId), {});
        cb(null, byId);
    })
        .catch(cb);
}
exports.getTaskModel = getTaskModel;
function getMetaModel(cfg, cb) {
    const metadata = {
        in: {
            "type": "object",
            "properties": {
                "id": {
                    "title": "1",
                    "type": "integer",
                    "required": true
                },
                "name": {
                    "title": "Room",
                    "type": "string",
                    "required": true
                }
            }
        },
        out: {
            "type": "object",
            "properties": {
                "id": {
                    "title": "1",
                    "type": "integer",
                    "required": true
                },
                "name": {
                    "title": "Room",
                    "type": "string",
                    "required": true
                }
            }
        }
    };
    return cb(null, metadata);
}
exports.getMetaModel = getMetaModel;
//# sourceMappingURL=common.js.map