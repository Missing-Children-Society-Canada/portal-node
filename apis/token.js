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
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                console.log("Email sent successfullly!")
                console.log("Response Status code "+response.statusCode);
                console.log("Id "+userid)
                resolve(response);
            }
            else if (error)
            {
                console.log("Error while sending email!")
                console.log("Response Status code "+response.statusCode);
                reject(response);
            }
            else 
            {
                
                console.log("Not sure if it worked!")
                console.log("Response body "+response.body);
                console.log("Response status code "+response.statusCode);
                reject(response);
            }
        }
    );
    resolve(r);
});
}

Token.prototype.check = function(id, token) 
{
    return new Promise((resolve, reject) => {
        var r;
        request.post(
        config.validateTokenUrl,
        { 
            json:{
                'id': id,
                'token': token
            }
        },
        function (error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                resolve(response);
            }
            else if (error)
            {
                reject(response);
            }
            else 
            {
                reject(response);
            }
        }
    );
    resolve(r);
});
}

module.exports = Token;