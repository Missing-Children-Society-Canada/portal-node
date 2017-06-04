'use strict';

var config = require('../config');
var ProfileApi = require('../apis/profiles');

exports.show = function (req, res) {
  console.log("-------------------------------------------------");
  console.log(JSON.stringify(req.user, null, 4));
  console.log("-------------------------------------------------");

  new ProfileApi(config.docDB).get(req.params.id).then((profile) => {
    res.render('profiles/show', {
      user: req.user,
      profile: profile
    });
  });
}