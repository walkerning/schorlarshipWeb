var models = require("../models");
var errors = require("../errors");

module.exports = function readPermissions(req, res, next) {
  if (req.auth === undefined) {
    next(new errors.UnauthorizedError());
  } else {
    return models.User.forge({
      id: req.auth.id
    })
      .fetch({
        withRelated: ["permissions", "group"]
      })
      .then(function loadContextUser(user) {
        if (!user) {
          next(new errors.UnauthorizedError());
        } else {
          req.user = user;
          next();
        }
      })
      .catch(function(err) {
        next(new errors.InternalServerError());
      });
  }
};
