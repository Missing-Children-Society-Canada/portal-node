'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');


exports.send = function(req, res) {
  new TokenApi().send(req.body.userid, req.body.email).then(
    function() {
      console.log("Send success");
      res.status(200).json(null).send();
    },
    function() {
      console.log("Send failed");
      res.status(400).json(null).send();
    });
  }

