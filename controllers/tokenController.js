'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');

exports.send = function (req, res) {
  var mailSender = new TokenApi();
  mailSender.send(req.body.userid, req.body.email).then(
    function (result) {
      console.error("send.then - resolved");    
      // real response from call can be pulled from result.statusCode.
      // defaulting to 200 to simplify / match UI code  
      res.status(200).json(result).send();
    },
    function (err) {
      console.error("send.then - rejected");
      // real response from call can be pulled from err.statusCode.
      // defaulting to 500 to simplify / match UI code
      res.status(500).json(err).send();
    })
    
    .catch(function (err) {
      console.error("send.catch");
      res.status(500).json(null).send();
});
}