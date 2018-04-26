"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;

exports.process = processAction;

function processAction(msg, cfg) {

    const org = cfg.org;
    const body = msg.body;
    const title = body.title;
    const body = body.messageBody;



    if (!title) {
        throw new Error('title is required');
    }
    if (!body) {
        throw new Error('message is required');
   }

    console.log('Getting data for message');

    const fullMessage = {
      title,
      body
    }

    return messages.newMessageWithBody(fullMessage));
}
