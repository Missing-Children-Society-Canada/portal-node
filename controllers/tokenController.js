'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');

exports.send = function (req, res) {
  new TokenApi().send(req.body.userid, req.body.email).then(
    function () {
      res.status(200).json(null).send();
    },
    function () {
      console.error("Problem saving or sending access token.")
      res.status(400).json(null).send();
    }).catch(function (err) {
      console.error('Problem saving or sending access token :', err.statusText);
});;
}