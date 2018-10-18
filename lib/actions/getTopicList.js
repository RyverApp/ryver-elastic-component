"use strict";
const btoa = require('btoa');
const co = require('co');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.postList = common.postList;
exports.process = processAction;
exports.listChat = listChat;




function listChat(cfg, cb) {

  const org = cfg.org;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;
  var type = getType(cfg.type);

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/${type}`,
      json: true
  };


  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

    var results = response.d.results;
    var result = {};

      if(type !== 'users'){
        results.forEach(function(chat) {
            result[chat.id] = chat.name;
        });

      }else {
        results.forEach(function(chat) {
          if (cfg.user !== chat.username) {
              result[chat.id] = chat.displayName;
          }
        });
      }
        cb(null, result);
    }
  }

function processAction(msg, cfg) {

    const org = cfg.org;
    const message = msg.body;
    const body = message.body;
    const subject = message.subject;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;

    var type = getType(cfg.type);
    var typePost = typeForPost(type);
    var inId = parseInt(cfg.chatId);

    console.log('About to list topics');

    const listOfTopic = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cfg.chatId})/Post.Stream(archived=false)?$format=json`,
        json: true
    };

    return request.get(listOfTopic).then((response) =>{
      console.log(cfg.chatId);

        var topicList = {
            topics: []
        };
        var results = response.d.results;
        var result = {};

        results.forEach(function(topic) {

          topicList.topics.push({
            "id": topic.id,
            "subject": topic.subject,
            "body": topic.body,
            "comments":topic.commentsCount
          });
        });
        console.log(topicList.topics);
        return messages.newMessageWithBody({
            topics: topicList.topics
        });
    });


}

function getType(type) {

    switch (type) {
      case "Forums":
        var type = type.toLowerCase();

        break;
      case "Teams":
        var type = "workrooms";

        break;

    }
  return type;
}

function typeForPost(type){
  switch (type) {
    case "forums":
      var type = "Forum";

      break;
    case "workrooms":
      var type = "Workroom";

      break;

  }
  return type;
}

function getChatId(name, org, type, auth) {

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/${type}`,
      json: true
  };

  request.get(requestId).then((response) => {
    var results = response.d.results;
    var result = {};

      if(type !== 'users'){
        results.forEach(function(chat) {
          if (chat.name === name) {
            return chat.id;
          }
        });

      }else {
        results.forEach(function(chat) {
          if (cfg.user !== chat.username) {
            if (chat.username === name) {
              return chat.id;
            }
          }
        });
      }
  });
}