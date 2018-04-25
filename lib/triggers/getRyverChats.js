"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elastic-node').messages;

exports.process = processTrigger;

function processTrigger(msg, cfg) {

  const org = cfg.organization;
  const body = msg.body;
  const chat = cfg.chat;
  const b64 = btoa(`${cfg.user}:${cfg.pass}`);
  const auth = `Basic ${b64}`;

  if(!chat){
    throw new Error('Chat field is required');
  }

  console.log('Getting chats from: ', chat);

  const requestChats = {
    headers: {
        'authorization': auth
      },
      url: `https://${org}.ryver.com/api/1/odata.svc/${chat}`,
      json: true
  }

  request.get(requestChats)
      .then((response) => {
        return messages.newMessageWithBody({
          results: response.d.results
        });
    });
}
