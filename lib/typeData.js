"use strict";
const btoa = require('btoa');
const request = require('request-promise');
const messages = require('elasticio-node').messages;

exports.listType = listType;

function listType(cfg, cb) {

  var typeList = {
    'forums': 'Forums',
    'workrooms': 'Teams',
    'users': 'Users'
  };

  cb(null, typeList);

}

function getMetaModel(cfg, cb){

  var metadata = {
    in:{"type": "object",
    "properties": {
      "id": {
        "title": "1",
        "type": "integer",
        "required": true
      },
      "name": {
        "title": "Room",
        "type": "string",
        "required": true
      }
    }},
    out:{
      "type": "object",
      "properties": {
        "id": {
          "title": "1",
          "type": "integer",
          "required": true
        },
        "name": {
          "title": "Room",
          "type": "string",
          "required": true
        }
      }
    }
  };
  return  cb(null, metadata);
}
