'use strict';

var config = require('../config');
var ProfileApi = require('../apis/profiles');

exports.list = function(req, res){
  new ProfileApi(config.docDB).getList().then(function(profiles) {
    res.json(profiles);
  });
};

exports.show = function(req, res) {
  new ProfileApi(config.docDB).get(req.params.id).then((profile) => {
    res.render('profiles/show', {
      user: req.user,
      profile: profile
    });
  }); 
}