'use strict';
var DocumentDBClient = require('documentdb').DocumentClient;
var http = require('http');
var request = require('request');

/*
sendEmailInvite(email: string, personId: string) {
        if (email != null) {
            console.log("Make it to send shit");
            console.log("Email: " + email);
            console.log("Person Id: " + personId);
            // What to do with the response
            var response = this.http.post("https://mscs-cf-functions.azurewebsites.net/api/notify_police?code=9hDa/Q8w5UX69H3WaxQPR5jdGOEok6Vub2PIbKpEHawJda19TfqIeg==",
                {
                    'email': email,
                    'userId': personId
                })
                .map(response => response.json())
                .toPromise()
                .then(res => {
                    console.log(res);
                    return res;
                });
        }
        else {
            console.log("Couldn't send anything. Email was null!")
        }
    }
*/



var Token = function() {
}

Token.prototype.send = function(id, email) 
{
    return new Promise((resolve, reject) => {
        var r;
        request.post(
        config.notifyPoliceUrl,
        { 
            json:{
                'email': email,
                'userId': id
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                r = response.statusCode
                resolve(response);
            }
            else 
            {
                console.log("Error while calling!")
                console.log("Response Body "+response.body)
                r = response.statusCode
                reject(response);
            }
        }
    );
    resolve(r);
    reject("DUNNO!");
});

    /*
    return http.post("https://mscs-cf-functions.azurewebsites.net/api/notify_police?code=9hDa/Q8w5UX69H3WaxQPR5jdGOEok6Vub2PIbKpEHawJda19TfqIeg==",
    {
        'email': email,
        'userId': id
    })
    .map(response => response.json())
    .toPromise();
    */
        /*
    var response = this.http.post("https://mscs-cf-functions.azurewebsites.net/api/notify_police?code=9hDa/Q8w5UX69H3WaxQPR5jdGOEok6Vub2PIbKpEHawJda19TfqIeg==",
                {
                    'email': email,
                    'userId': id
                })
                .map(response => response.json())
                .toPromise()
                .then(res => {
                    console.log(res);
                    return res;
                });*/
    }


Token.prototype.check = function(id, token) {
    return this.http.post("https://mscs-cf-functions.azurewebsites.net/api/notify_police?code=9hDa/Q8w5UX69H3WaxQPR5jdGOEok6Vub2PIbKpEHawJda19TfqIeg==",
                {
                    'token': token,
                    'userId': id
                })
                .map(response => response.json())
                .toPromise();
        /*
    var response = this.http.post("https://mscs-cf-functions.azurewebsites.net/api/notify_police?code=9hDa/Q8w5UX69H3WaxQPR5jdGOEok6Vub2PIbKpEHawJda19TfqIeg==",
                {
                    'email': email,
                    'userId': id
                })
                .map(response => response.json())
                .toPromise()
                .then(res => {
                    console.log(res);
                    return res;
                });*/
    }

// Gets the full name from the event
module.exports = Token;