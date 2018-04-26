"use strict";
const co = require('co');
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.listTeamChats = common.listTeamChats;
exports.process = processAction;

function processAction(msg, cfg) {

  const org = cfg.org;
  const message = msg.body;
  const body = message.body;
  const title = message.title;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;


  if (!title) {
      throw new Error('title is required');
  }
  if (!body) {
      throw new Error('message is required');
 }


  console.log('About to send messages to Ryver');

  var requestOptions={
    headers: {'content-type' : 'application/json',
              'accept': 'application/json',
              'authorization': auth
            },
    url:     `https://${org}.ryver.com/api/1/odata.svc/workrooms(${cfg.chatId})/Chat.PostMessage()`,
    json:    {
      "body": body,
      "createSource":{
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
