import { SimpleRyverAPIRequest } from './api';
import btoa from 'btoa';

// utilities
export function createAuth(cfg: any): string {
    return cfg.user ? `Basic ${btoa(`${cfg.user}:${cfg.pass}`)}` : `Bearer ${cfg.token}`;
}

export function getResource(type: string): string {
    const resource = type && type.toLowerCase();
    if (resource === 'teams') {
        return 'workrooms';
    }

    return resource || '';
}

export function getPostType(type: string) {
    if (type === 'forums') {
        return 'Forum';
    } else if (type === 'workrooms') {
        return 'Workroom';
    }

    return type;
}

// field models
export function getTeamOrForumModel(cfg, cb) {
    const types = {
        'Forums': 'Forums',
        'Teams': 'Teams'
    };

    cb(null, types);
}

export function getEntityTypeModel(cfg, cb) {
    const types = {
        'Forums': 'Forums',
        'Teams': 'Teams',
        'Users': 'Users'
    };

    cb(null, types);
}

export function getEntityModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);
    const resource = getResource(cfg.type);

    if (!cfg.type) {
        console.log('Type is missing');
        cb(null, {});
        return;
    }

    new SimpleRyverAPIRequest(org, auth)
        .get(resource)
        .then(res => {
            let byId;

            if(resource !== 'users') {
                byId = res.reduce((byId, entity) => (
                    byId[entity.id] = entity.name,
                    byId
                ), {});
            } else {
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

export function getMemberModel(cfg, cb) {
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

    new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/members`, { '$expand': 'member', '$select': 'member' })
        .then(res => {
            const byId = res.reduce((byId, entity) => (
                byId[entity.member.id] = entity.member.displayName,
                byId
            ), {});
            cb(null, byId);
        })
        .catch(cb);
}

export function getTopicModel(cfg, cb) {
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

    new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/Post.Stream(archived=false)`, { '$format': 'json' })
        .then(res => {
            const byId = res.reduce((byId, topic) => (
                byId[topic.id] = topic.subject,
                byId
            ), {});
            cb(null, byId);
        })
        .catch(cb);
}

export function getCategoryModel(cfg, cb) {
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

    new SimpleRyverAPIRequest(org, auth)
        .get(`${resource}(${cfg.entityId})/board`, { '$select': 'id' })
        .then(res => (
            new SimpleRyverAPIRequest(org, auth)
                .get(`taskBoards(${res.id})/categories`, { '$select': 'id,name' })
        ))
        .then(res => {
            const byId = res.reduce((byId, category) => (
                byId[category.id] = category.name,
                byId
            ), {});
            cb(null, byId);
        })
        .catch(cb);
}

export function getTaskModel(cfg, cb) {
    const org = cfg.org;
    const auth = createAuth(cfg);

    if (!cfg.category) {
        console.log('Category is missing');
        cb(null, {});
        return;
    }

    new SimpleRyverAPIRequest(org, auth)
    .get(`taskCategories(${cfg.category})/tasks`)
    .then(res => {
        const byId = res.reduce((byId, task) => (
            byId[task.id] = task.subject,
            byId
        ), {});
        cb(null, byId);
    })
    .catch(cb);
}

export function getMetaModel(cfg, cb){
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
