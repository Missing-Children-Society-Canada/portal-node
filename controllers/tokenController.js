'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');


exports.send = function(req, res) {
  new TokenApi().send(req.body.userid, req.body.email).then((r) => {
    res.json(r);
  }); 
}
  exports.check = function(req, res) {
    new TokenApi().check(req.body.userid, req.body.token).then((r) => {
    res.json(r);
    res.end(r);
  }); 

}
