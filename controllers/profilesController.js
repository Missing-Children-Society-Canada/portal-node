'use strict';
var ProfileApi = require('../apis/profiles');

exports.list = function(req, res){
  var profiles = new ProfileApi().getList().then(function(profiles) {
    res.json(profiles);
  });
};
