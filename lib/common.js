"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;


exports.listForums = listForums;
exports.listTeams = listTeams;
exports.listUsers = listUsers;

function listForums(cfg, cb) {

  const org = cfg.org;
  // const body = msg.body;
  // const title = body.title;
  // const message = body.message;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;

  // var rooms = {
  //     chats: []
  // };

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/forums`,
      json: true
  };


  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

        var results = response.d.results;
        var result = {};
        results.forEach(function(chat) {
            result[chat.id] = chat.name;
        });
        cb(null, result);
  }
}

function listTeams(cfg, cb) {

  const org = cfg.org;
  // const body = msg.body;
  // const title = body.title;
  // const message = body.message;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;

  // var rooms = {
  //     chats: []
  // };

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/workrooms`,
      json: true
  };


  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

        var results = response.d.results;
        var result = {};
        results.forEach(function(chat) {
            result[chat.id] = chat.name;
        });
        cb(null, result);
  }
}

function listUsers(cfg, cb) {

  const org = cfg.org;
  // const body = msg.body;
  // const title = body.title;
  // const message = body.message;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;

  // var rooms = {
  //     chats: []
  // };

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/users`,
      json: true
  };


  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

        var results = response.d.results;
        var result = {};
        results.forEach(function(chat) {
          if (cfg.user !== chat.username) {
              result[chat.id] = chat.displayName;
          }
        });
        cb(null, result);
  }
}

function getMetaModel(cfg, cb){

  var metadata = {
    in:{"type": "object",
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
    }},
    out:{
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
return  cb(null, metadata);
}
