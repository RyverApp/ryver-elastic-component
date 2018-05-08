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
    // const message = msg.body;
    // const body = message.body;
    // const subject = message.subject;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;

    var type = getType(cfg.type);
    var typePost = typeForPost(type);
    var cId = parseInt(cfg.chatId);

    console.log('About to get chat history');

    const chatHistory = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cId})/Chat.History()?$format=json&$top=5`,
        json: true
    };

    return request.get(chatHistory).then((response) =>{
      var messageList = {
          mssgs: []
      };

      var results = response.d.results;
      var result = {};

      results.forEach(function(mssg) {
        console.log("ID"+mssg.id);
        console.log("TIME"+mssg.when);
        console.log("FROM"+mssg.from.__descriptor);
        console.log("TO"+mssg.to.__descriptor);
        console.log("BODY"+mssg.body);
        console.log("TYPE"+mssg.messageType);

        messageList.mssgs.push({
          "id": mssg.id,
          "date": mssg.when,
          "from": mssg.from.__descriptor,
          "to": mssg.to.__descriptor,
          "body": mssg.body,
          "type": mssg.messageType
        });
      });

      console.log(messageList.mssgs);

      return messages.newMessageWithBody({
          history: messageList.mssgs
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
      case "Users":
        var type = type.toLowerCase();

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
    case "users":
      var type = "User";

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
