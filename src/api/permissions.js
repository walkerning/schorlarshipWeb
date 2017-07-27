var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var schema = require("../data").schema;
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    return models.Permissions.getByQuery(req.query)
      .then(function(col) {
        res.status(200).json(col.toClientJSON());
      });
  },

  listUsers: function listUsers(req, res, next) {
    return models.Permission
      .getByName(req.params.permissionName)
      .then(function(perm) {
        return perm.listUsers()
          .then(function(users) {
            res.status(200).json(users.toClientJSON());
          });
      });
  },

  addUser: function addUser(req, res, next) {
    var userId = req.body["user_id"];
    if (!userId) {
      next(new errors.BadRequestError({}));
      return Promise.resolve(null);
    }
    return models.Permission
      .getByName(req.params.permissionName)
      .then(function(perm) {
        return perm.addUser(userId)
          .then(function() {
            res.status(200).json({});
          });
      });
  },

  deleteUser: function deleteUser(req, res, next) {
    var userId = req.params.userId;
    return models.Permission
      .getByName(req.params.permissionName, {
        noreject: true
      })
      .then(function(perm) {
        var start = Promise.resolve(null);
        if (perm) {
          start = perm.deleteUser(userId);
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  }
};
