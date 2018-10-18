"use strict";
const btoa = require('btoa');
const co = require('co');
const moment = require('moment');
const request = require('request-promise');
const messages = require('elasticio-node').messages;
var common = require('../common.js');

exports.postList = common.postList;
exports.process = processAction;
exports.listChat = listChat;
exports.listCategory = listCategory;
exports.listUsers = listUsers;


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
        if (task.name !== "") {

        }
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
    const subject = message.subject;
    const tags = message.tags;
    const checkList = message.checkList;
    const completed = cfg.completed;
    const avatar = message.avatar;
    const ids = message.idAssign;
    const b64 = btoa(`${cfg.user}:${cfg.pass}`);
    const auth = `Basic ${b64}`;
    const cat = parseInt(cfg.cat);
    
    var type = getType(cfg.type);

    console.log('About to create a task');
    console.log('CFG'+JSON.stringify(cfg))
    console.log('msg'+JSON.stringify(msg))

    // var requestOptions = "";

    const boardId = {

        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        },

        url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cfg.chatId})/board?$select=id`,
        json: true
    };

    


    var task = request.get(boardId).then((response) =>{
      var board = parseInt(response.d.results.id);

      if(!ids && !cfg.assign){
        var nothing = "";
        var idList = nothing.split(",");
      }
      else if (cfg.assign && !ids) {
        var idList = cfg.assign.split(",");
      }
      else if (!cfg.assign && ids) {
        var idList = ids.split(",");
      }

      var userList = {
          users: []
      };

      idList.forEach(function(user) {
        userList.users.push({
          "id": user.trim()
        });
      });

      if(ids || cfg.assign){
        var resu = {
          "results":userList.users
        }
      }

          if (!cat) {
             var requestOptions ={
                headers: {'content-type' : 'application/json',
                          'accept': 'application/json',
                          'authorization': auth
                        },
                url:     `https://${org}.ryver.com/api/1/odata.svc/tasks`,
                json:    {
                  "subject": subject,
                  "body": body,
                  "assignees":resu,
                  "board": {
                    "id": board
                  }
                }
              };
          }
          else {
              var requestOptions ={
                headers: {'content-type' : 'application/json',
                          'accept': 'application/json',
                          'authorization': auth
                        },
                url:     `https://${org}.ryver.com/api/1/odata.svc/tasks`,
                json:    {
                  "subject": subject,
                  "body": body,
                  "assignees":resu,
                  "category": {
                    "id": cat
                  },
                  "board": {
                    "id": board
                  }
                }
              };
          }
          request.post(requestOptions).then((resData) => {
            
            console.log(resData)

            var data = resData.d.results; 

            var taskId = data.id;
            // taskDate = data.createDate;
            // taskShort = data.short;
            // taskSubject = data.subject;
            // taskBody = data.body;
            // taskBoardId = data.board.id;
            // taskCatId = data.category.id;
            // createUserId = data.createUser.id;
            // createUserName = data.createUser._descriptor;

            console.log(resData.d.results.id);

            if(tags){
              var tagList = tags.split(",")

              var tagsJson = {
                tags: []
              };
      
              tagList.forEach(function(tag) {
                tagsJson.tags.push(tag.trim());
              });

              var tagRequest = {
                method: 'PATCH',
                headers: {'content-type' : 'application/json',
                  'accept': 'application/json',
                  'authorization':auth
                },
                url: `https://${org}.ryver.com/api/1/odata.svc/tasks(${taskId})?$select=id,__descriptor,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,tags,board%2Fid,board%2F__descriptor,category%2Fid,category%2F__descriptor,category%2FcategoryType,parent%2Fid,createUser%2Fid,createUser%2F__descriptor,modifyUser%2Fid,modifyUser%2F__descriptor,assignees%2Fid,assignees%2F__descriptor,attachments%2Fid,attachments%2Ftype,attachments%2Furl,attachments%2FcreateDate,attachments%2FfileSize,attachments%2FfileName,attachments%2FshowPreview,attachments%2Fembeds,attachments%2FrecordType,subTasks%2Fid,subTasks%2Fsubject,subTasks%2FcompleteDate,subTasks%2Fposition,embeds,extras,__reactions,__subscribed&$expand=board,category,parent,createUser,modifyUser,assignees,attachments,subTasks`,
                json: tagsJson
              };

              request.patch(tagRequest).then((tagResponse) =>{
                console.log(tagResponse)
              });
            }

          if(checkList){
            var checklistItems = checkList.split(",")
            var itemList = {
                subTasks: {
                    results:[]
                }
             };
   
             checklistItems.forEach(function(item) {
                itemList.subTasks.results.push({
                    "subject": item.trim()
                });
             });

            var checklistRequest = {
                method: 'PATCH',
                headers: {'content-type' : 'application/json',
                'accept': 'application/json',
                'authorization':auth
                },
                url: `https://${org}.ryver.com/api/1/odata.svc/tasks(${taskId})?$select=id,__descriptor,modifyDate,createDate,dueDate,completeDate,createSource,archived,short,subject,body,quote,position,commentsCount,attachmentsCount,tags,board%2Fid,board%2F__descriptor,category%2Fid,category%2F__descriptor,category%2FcategoryType,parent%2Fid,createUser%2Fid,createUser%2F__descriptor,modifyUser%2Fid,modifyUser%2F__descriptor,assignees%2Fid,assignees%2F__descriptor,attachments%2Fid,attachments%2Ftype,attachments%2Furl,attachments%2FcreateDate,attachments%2FfileSize,attachments%2FfileName,attachments%2FshowPreview,attachments%2Fembeds,attachments%2FrecordType,subTasks%2Fid,subTasks%2Fsubject,subTasks%2FcompleteDate,subTasks%2Fposition,embeds,extras,__reactions,__subscribed&$expand=board,category,parent,createUser,modifyUser,assignees,attachments,subTasks`,
                json: itemList
            };

            request.patch(checklistRequest).then((checklistResponse) =>{
                console.log(checklistResponse)
            });

             console.log(JSON.stringify(itemList))
        }

        if(completed){
          var markTask = {
              method: 'PATCH',
              headers: {'content-type' : 'application/json',
              'accept': 'application/json',
              'authorization':auth
              },
              url: `https://${org}.ryver.com/api/1/odata.svc/tasks(${taskId})`,
              json: {"completeDate":moment().format()}                            
          };

          console.log(markTask)

          
          request.patch(markTask).then((markResponse) =>{
              console.log(markResponse)
          }); 
      }            

          return resData ;

          });

    });


    return co(function* gen() {

      return messages.newMessageWithBody(task);


        // return messages.newMessageWithBody({
        //     // "id":taskId,
        //     // "date":taskDate,
        //     // "short":taskShort,
        //     // "subject":taskSubject,
        //     // "body" : taskBody,
        //     // "boardId":taskBoardId,
        //     // "categoryId":taskCatId,
        //     // "userCreateId":createUserId,
        //     // "userCreateName":createUserName
        // });
    });

}

function getBoardId(msg, cfg) {

  const org = cfg.org;
  const message = msg.body;
  const body = message.body;
  const subject = message.subject;
  const avatar = message.avatar;
  const ids = message.idAssign;
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
    console.log(board);
    return board;
  });

}

function listUsers(cfg, cb) {

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


      // url: `https://${org}.ryver.com/api/1/odata.svc/users`,
      url: `https://${org}.ryver.com/api/1/odata.svc/${type}(${cfg.chatId})/members?$expand=member&$select=member`,

      json: true
  };

  request.get(requestId).then(handleResult).catch(cb).done();

  function handleResult(response) {

    var results = response.d.results;
    var result = {};

      results.forEach(function(chat) {
        result[chat.member.id] = chat.member.displayName;
      });
        cb(null, result);
    }
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
