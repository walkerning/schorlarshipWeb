var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    var queries = req.query;
    return models.Users.getByQuery(queries)
      .then(function(collection) {
        var obj = collection.toClientJSON();
        if ("group" in queries) {
          obj = _.filter(obj, (value) => {
            return value["group"] == queries["group"];
          });
        }
        if ("admin" in queries && _.toInteger(queries["admin"])) {
          obj = _.filter(obj, (value) => {
            return value["permissions"].length != 0;
          });
        }
        res.status(200).json(obj);
      });
  },

  create: function create(req, res, next) {
    var body = req.body;
    if (body["student_id"] === undefined) {
      return Promise.reject(new errors.BadRequestError({
        message: "`student_id` field is required."
      }));
    }
    if (body["password"] === undefined) {
      // Application logic: default password is the student_id
      body["password"] = body["student_id"];
    }
    return models.User.create(body, req.user)
      .then(function(user) {
        res.status(201).json(user.toClientJSON());
      });
  },

  info: function info(req, res, next) {
    return models.User.getById(req.params.userId)
      .then(function(user) {
        res.status(200).json(user.toClientJSON());
      });
  },

  infoMe: function info(req, res, next) {
    return models.User.getById(req.user.get("id"))
      .then(function(user) {
        res.status(200).json(user.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.User.getById(req.params.userId)
      .then(function(user) {
        // Application logic: the user admin cannot update password. 
        // can only reset password through the `newPassword` API.
        if (req.body.password !== undefined && req.user.get("id") != user.get("id")) {
          delete req.body.password;
        }
        return user.update(req.body, req.user)
          .then(function() {
            return models.User.getById(req.params.userId)
              .then(function(user) {
                res.status(200).json(user.toClientJSON());
              });
          });
      });
  },

  // TODO: 改成设置active标签
  // DELETE: idempotent
  delete: function _delete(req, res, next) {
    return models.User.getById(req.params.userId, {
      noreject: true
    })
      .then(function(user) {
        var start = Promise.resolve(null);
        if (user) {
          start = user.destroy();
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  },

  newPassword: function newPassword(req, res, next) {
    return models.User.getById(req.params.userId)
      .then(function(user) {
        // TODO: the reset password should be random and sent to the user's email
        return user.update({
          password: user.get("student_id")
        }, req.user)
          .then(function() {
            res.status(201).json({}).end();
          });
      });
  }
};

