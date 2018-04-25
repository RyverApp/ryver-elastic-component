"use strict";
const btoa = require('btoa');
const request = require('request');
const debug = require('debug')('verifyCredentials')

module.exports = function verifyCredentials(credentials, cb) {

    var org = credentials.org;
    var user = credentials.user;
    var pass = credentials.pass;
    var b64 = btoa(`${user}:${pass}`);
    var auth = `Basic ${b64}`;
    var uri = `https://${org}.ryver.com/api/1/odata.svc/User.GetCurrent()`;

    if (!user) {
        throw new Error('Username is missing');
    }
    if (!org) {
        throw new Error('Organization name is missing');
    }
    if (!pass) {
        throw new Error('Password is missing');
    }

    var requestData = {
        url: uri,
        headers: {
            'content-type' : 'application/json',
            'accept': 'application/json',
            'authorization': auth
        }
    };


    request.get(requestData, checkResponse);

    function checkResponse(err, response, body) {
      if(err){
        return cb(err);
      }
      debug('Ryver response was: %s %j', response.statusCode, body);
      if(response.statusCode == 401){
        return cb(null, {verified: false});
      }
      if (response.statusCode === 403) {
          return cb(null, {verified: false, details: NOT_ENABLED_ERROR});
      }
      if (response.statusCode !== 200) {
          return cb(new Error('Ryver respond with ' + response.statusCode));
      }
      return cb(null, {verified: true});

    }
}
