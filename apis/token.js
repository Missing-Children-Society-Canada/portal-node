'use strict';
var DocumentDBClient = require('documentdb').DocumentClient;
var http = require('http');
var request = require('request');
var config = require('../config');
var Token = function() {
}

Token.prototype.send = function(userid, email) 
{
    return new Promise((resolve, reject) => {
        var r;
        request.post(
        config.notifyPoliceUrl,
        { 
            json:{
                'email': email,
                'userid': userid
            }
        },
        function (error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) 
            {
                // Does this send a success response back?
                resolve(response);
            }
            else 
            {
                // Does this send a failed response back?
                reject(response);
            }
        }
    );
    resolve();
});
}

Token.prototype.verify = function(id, token) 
{
    return new Promise((resolve, reject) => {
        request.post(
        config.validateTokenUrl,
        { 
            json:{
                'userid': id,
                'token': token
            }
        },
        function (error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                // Body should be "true" if token is valid
                var body = JSON.parse(response.body);
                if (body ===  true)
                {
                    resolve(response.body);
                }
                else
                {
                    reject(response.body);
                }
            }
            else
            {
                reject(response.body);
            }
            
        }
    );
});
}

module.exports = Token;