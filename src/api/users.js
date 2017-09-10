var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var models = require("../models");
var errors = require("../errors");

function listAll(req, res, next) {
  var queries = req.query;
  return models.Users.getByQuery(queries)
    .then(function(collection) {
      var obj = collection.toClientJSON();
      if ("group" in queries) {
        obj = _.filter(obj, (value) => {
          return value["group"] == queries["group"];
        });
      }
      // Query `?admin=1` return all the users with permissions other than "login"
      if ("admin" in queries && _.toInteger(queries["admin"])) {
        obj = _.filter(obj, (value) => {
          // FIXME: add `is admin permission` field into the permission table?
          return _.difference(value["permissions"], ["user", "apply"]).length > 0
        });
      }
      res.status(200).json(obj);
    });    
}

// TODO: use a more efficient way
function listPage(req, res, next) {
  var queries = req.query;
  if (!(queries.hasOwnProperty("page") && queries.hasOwnProperty("pageSize"))) {
    return Promise.reject(new errors.BadRequestError({
      message: "`page` and `pageSize` field is required."
    }));    
  }
  var page = _.toInteger(queries["page"]);
  var pageSize = _.toInteger(queries["pageSize"]);
  return models.Users.getByQuery(queries)
    .then(function(collection) {
      var obj = collection.toClientJSON();
      if ("group" in queries) {
        obj = _.filter(obj, (value) => {
          return value["group"] == queries["group"];
        });
      }
      // Query `?admin=1` return all the users with permissions other than "login"
      if ("admin" in queries && _.toInteger(queries["admin"])) {
        obj = _.filter(obj, (value) => {
          // FIXME: add `is admin permission` field into the permission table?
          return _.difference(value["permissions"], ["login", "apply"]).length > 0
        });
      }
      var pagination = {
        page: page,
        pageSize: pageSize,
        rowCount: obj.length,
        pageCount: Math.ceil(obj.length / pageSize)
      }
      res.status(200).json({ data: obj.slice((page - 1) * pageSize, page * pageSize), pagination: pagination});
    });     
}

module.exports = {
  list: function list(req, res, next) {
    if (req.query.hasOwnProperty("page")) {
      return listPage(req, res, next);
    } else {
      return listAll(req, res, next);
    }
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
        // Default permissions.
        // FIXME: maybe move to outer api logic?
        return Promise.map([1, 2], function(permId) {
          return models.Permission.getById(permId)
            .then(function(perm) {
              return perm.addUser(user.get("id"));
            });
        })
          .then(function() {
            return models.User.forge({"id": user.get("id")}).fetch()
              .then(function(user) {
                res.status(201).json(user.toClientJSON());
              });
          });
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
    /*
    return models.User.getById(req.params.userId)
      .then(function(user) {
        // TODO: the reset password should be random and sent to the user's email
        // var newPass = user.get("student_id");
        var newPass = passwordGenerator.generate();
        return user.update({
          password: newPass
        }, req.user)
          .then(function() {
            return user.sendEmail("Password reset: Your new password at EEScholarshipWeb", util.format("Your new password is: %s\n", newPass));
          })
          .then(function() {
            res.status(201).json({}).end();
          });
      });
  }
  */
    return models.User.getById(req.params.userId)
      .then(function(user) {
        var newPass = user.get("student_id");
        //var newPass = passwordGenerator.generate();
        return user.update({
          password: newPass
        }, req.user)
          .then(function() {
            res.status(201).json({}).end();
          });
      });
  }
};

