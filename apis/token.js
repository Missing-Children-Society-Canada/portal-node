'use strict';
var DocumentDBClient = require('documentdb').DocumentClient;
var http = require('http');
var request = require('request');
var config = require('../config');
var Token = function () {
}

Token.prototype.send = function (userid, email) {
    return new Promise((resolve, reject) => {
        var r;
        request.post(
            config.notifyPoliceUrl,
            {
                json: {
                    'email': email,
                    'userid': userid
                }
            },
            function (error, response, body) {
                if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                    console.error("Success notifying police");
                    resolve(response);
                }
                else {
                    if (error)
                    {
                        console.error("Error notifying police : "+error);
                        reject(Error(error));
                    }
                    else
                    {
                        console.error("Issue notifying police : "+response.statusCode);
                        reject(response);
                    }
                }
            }
        );
        // resolve(); // this would force code to always resolve.
    });
}

Token.prototype.verify = function (id, token) {
    return new Promise((resolve, reject) => {
        request.post(
            config.validateTokenUrl,
            {
                json: {
                    'userid': id,
                    'token': token
                }
            },
            function (error, response, body) {
                if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                    // Body should be "true" if token is valid
                    var r = JSON.parse(response.body);
                    if (r === true) {
                        resolve();
                    }
                }
                reject();
            }
        );
    });
}

module.exports = Token;