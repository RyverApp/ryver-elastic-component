"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.listForumsChats = common.listForumsChats;
exports.process = processAction;

function processAction(msg, cfg) {

    const org = cfg.org;
    const message = msg.body.fullMessage;
    const body = message.body;
    const title = message.title;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;

   //
   //  if (!title) {
   //      throw new Error('title is required');
   //  }
   //  if (!body) {
   //      throw new Error('message is required');
   // }

   // console.log(JSON.stringify(cfg))
   //
   //  console.log('About to send messages to Ryver');
   //
   //  request.post({
   //    headers: {'content-type' : 'application/json',
   //              'accept': 'application/json',
   //              'authorization': 'Basic QW5nZWw6Q3VwY2FrZTMxNDE1JA=='
   //            },
   //    url:     `https://aojedacs.ryver.com/api/1/odata.svc/forums(1229339)/Chat.PostMessage()`,
   //    json:    {
   //      "body": cfg,
   //      "createSource":{
   //        "displayName": "mititulo"
   //      }
   //    }
   //    return true;
   //
   //  });

   return messages.newMessageWithBody(response);

}



function sendMessage(data){




}
