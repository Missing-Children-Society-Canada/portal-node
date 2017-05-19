var User = function(req) {
  this.isAuthenticated = req.isAuthenticated()
};

module.exports = User;