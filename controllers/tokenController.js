'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');

exports.send = function (req, res) {
  new TokenApi().send(req.body.userid, req.body.email).then(
    value => {
      console.log("Controller: Email was sent successfully");
      console.log(value); // Success!
      return res.status(200).json(value).send();
    }, reason => {
      console.log("Controller: Error in sending email");
      return res.status(500).json(reason).send();
    });
}