"use strict";
const btoa = require('btoa');
const co = require('co');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.postList = common.postList;
exports.process = processAction;
exports.listChat = listChat;
exports.listCategory = listCategory;


var id = "";

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



function listCategory(cfg, cb) {

  const org = cfg.org;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;
  var type = getType(cfg.type);

  const taskId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cfg.chatId})/board?$select=id`,
      json: true
  };

  request.get(taskId).then((response) =>{


    const requestId = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        // url: `https://${org}.ryver.com/api/1/odata.svc/taskBoards(1019659)/categories?$select=id,name`,
        url: `https://${org}.ryver.com/api/1/odata.svc/taskBoards(${parseInt(response.d.results.id)})/categories?$select=id,name`,


        json: true
    };

    id = parseInt(response.d.results.id);

    request.get(requestId).then(handleResult).catch(cb).done();

    function handleResult(response) {

      var results = response.d.results;
      var result = {};

      results.forEach(function(task) {
          result[task.id] = task.name;
      });

       cb(null, result);
      }
  });
}

function processAction(msg, cfg) {

    const org = cfg.org;
    const message = msg.body;
    const body = message.body;
    const title = message.title;
    const avatar = message.avatar;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;
    const cat = parseInt(cfg.cat);

    var type = getType(cfg.type);



    console.log('About to create a task');

    const boardId = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cfg.chatId})/board?$select=id`,
        json: true
    };

    request.get(boardId).then((response) =>{

      var board = parseInt(response.d.results.id);

      console.log("THIS BOARD ID: "+board);

      var requestOptions ={
          headers: {'content-type' : 'application/json',
                    'accept': 'application/json',
                    'authorization': auth
                  },
          url:     `https://${org}.ryver.com/api/1/odata.svc/tasks`,
          json:    {
            "task": {
              "subject": title,
              "body": body
            },
            "category": {
              // "id": 1098408
              "id": cat
            },
            "board": {
              // "id": 1019659
              "id": board
            }
          }
        };

        return co(function* gen() {
            const response = yield request.post(requestOptions);

            return messages.newMessageWithBody({
                "title":"titulin",
                "message" : "body"
                // "messageId" : response.d.id
            });
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
