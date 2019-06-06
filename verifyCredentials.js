"use strict";
const btoa = require('btoa');
const axios = require('axios');
const debug = require('debug')('verifyCredentials');

module.exports = function verifyCredentials(credentials, cb) {
    var org = credentials.org;
    var user = credentials.user;
    var pass = credentials.pass;
    var token = credentials.token;
    var auth;

    if (!org) {
        throw new Error('Organization name is missing');
    }

    if (!token && (!user || !pass)) {
        throw new Error('Integration token or username and password missing');
    }

    if (token) {
        auth = `Bearer ${token}`;
    } else {
        var b64 = btoa(`${user}:${pass}`);
        auth = `Basic ${b64}`;
    }

    var config = {
        headers: {
            'Content-Type' : 'application/json',
            'Accept': 'application/json',
            'Authorization': auth
        },
        validateStatus: function (status) {
            return status === 200;
        }
    };

    axios.get(`https://${org}.ryver.com/api/1/odata.svc/User.GetCurrent()`, config)
        .then(res => {
                debug('Ryver response was: %s %j', res.status, res.data);
                return cb(null, { verified: true });
            })
        .catch(err => {
            debug('Ryver response was: %s %j', err.response && err.response.status, err.response && err.response.data);
            return cb(null, { verified: false });
        });
}
