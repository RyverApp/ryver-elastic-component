"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;

exports.process = processAction;

function processAction(msg, cfg) {

    const org = cfg.org;
    const body = msg.body;
    const title = body.title;
    const message = body.message;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;


    if (!title) {
        throw new Error('title is required');
    }
    if (!message) {
        throw new Error('message is required');
   }

    console.log('About to send messages to Ryver');

    const requstId = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        url: `https://${org}.ryver.com/api/1/odata.svc/forums`,
        json: true
    };

    request.get(requstId).then((response) => {

    console.log(response.d.results[0].id);
      request.post({
        headers: {'content-type' : 'application/json',
                  'accept': 'application/json',
                  'authorization': auth
                },
        url:     `https://${org}.ryver.com/api/1/odata.svc/forums(${response.d.results[0].id})/Chat.PostMessage()`,
        json:    {
          "body": message,
          "createSource":{
            "displayName": title
          }
        }
      });

    });


    return true;
}
