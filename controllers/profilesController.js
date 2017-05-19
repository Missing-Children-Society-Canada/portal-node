'use strict';
var ProfileApi = require('../apis/profiles');
var User = require('../models/user');

exports.list = function(req, res){
  var profiles = new ProfileApi().getList().then(function(profiles) {
    res.json(profiles);
  });
};

exports.show = function(req, res) {
    var user = new User(req);  
    res.render('profiles/show', {
        user: user,
        profile: {
        id: 123,
        name: "test",
        photo: "shit"
    }});
}