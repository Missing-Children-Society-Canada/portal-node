'use strict';
var User = require('../models/user');
var config = require('../config');
var ProfileApi = require('../apis/profiles');

exports.list = function(req, res){
  new ProfileApi.getList(config.docDB).then(function(profiles) {
    res.json(profiles);
  });
};

exports.show = function(req, res) {
  var user = new User(req);
  new ProfileApi(config.docDB).get(req.params.id).then((profile) => {
    res.render('profiles/show', {
      user: user,
      profile: profile
    });
  }); 
}