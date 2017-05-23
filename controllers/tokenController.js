'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');


exports.send = function(req, res) {
  console.log("Sending email to "+req.body.email)
  new TokenApi().send(req.body.userid, req.body.email).then((r) => {
    res.json(r);
    res.end(r.statusCode);
  }); 
}
  exports.check = function(req, res) {
  var r = new TokenApi().check(req.body.userid, req.body.token).then((r) => {
    res.json(r);
    //res.end(200);
  }); 
}
