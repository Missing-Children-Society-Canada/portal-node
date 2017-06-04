'use strict';
var config = require('../config');
var TokenApi = require('../apis/token');

exports.send = function (req, res) {
  new TokenApi().send(req.body.userid, req.body.email).then(
    function (result) {
      res.status(200).json(result).send();
    },
    function (err) {
      res.status(500).json(err).send();
    })
    
    .catch(function (err) {
      res.status(500).json(null).send();
});
}