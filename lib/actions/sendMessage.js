"use strict";
const btoa = require('btoa');
const co = require('co');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.listType = common.listType;
exports.process = processAction;
exports.listChat = listChat;


function listChat(cfg, cb) {

  const org = cfg.org;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;

  const requestId = {

      headers: {
          'content-type' : 'application/json',
          'accept': 'application/json',
          'authorization': auth
      },

      url: `https://${org}.ryver.com/api/1/odata.svc/${cfg.type}`,
      json: true
  };


  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

    var results = response.d.results;
    var result = {};

      if(cfg.type !== 'users'){
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
    const title = message.title;
    const avatar = message.avatar;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;

   //
   //  if (!body) {
   //      throw new Error('message is required');
   // }


    console.log('About to send messages to Ryver');

  var requestOptions ={
      headers: {'content-type' : 'application/json',
                'accept': 'application/json',
                'authorization': auth
              },
      url:     `https://${org}.ryver.com/api/1/odata.svc/${cfg.type}(${cfg.chatId})/Chat.PostMessage()`,
      json:    {
        "body": body,
        "createSource":{
          "avatar": avatar,
          "displayName": title
        }
      }
    };

    return co(function* gen() {
        const response = yield request.post(requestOptions);

        return messages.newMessageWithBody({
            "title":title,
            "message" : body,
            "messageId" : response.d.id
        });
    });


}
