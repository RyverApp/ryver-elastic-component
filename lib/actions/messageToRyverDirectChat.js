"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.listDirectChats = common.listDirectChats;
exports.process = processAction;

function processAction(msg, cfg) {

    const org = cfg.org;
    const message = msg.fullMessage;
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



}

function sendMessage(){
  request.post({
    headers: {'content-type' : 'application/json',
              'accept': 'application/json',
              'authorization': auth
            },
    url:     `https://${org}.ryver.com/api/1/odata.svc/forums(1222252)/Chat.PostMessage()`,
    json:    {
      "body": listForumsChats,
      "createSource":{
        "displayName": title
      }
    }

  });


}
