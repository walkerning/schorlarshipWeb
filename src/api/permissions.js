var _ = require("lodash");
var models = require("../models");
var schema = require("../data").schema;
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    return models.Permission.fetchAll()
      .then(function(collection) {
        res.status(200).json(collection.toClientJSON());
      });
  },

  listUsers: function listUsers(req, res, next) {
    // TODO: move this to a `getUsers` method in permission model
    return models.Permission
      .forge({
        id: req.params.permissionId
      })
      .fetch({
        withRelated: ["users"]
      })
      .then(function(perm) {
        if (!perm) {
          next(new errors.NotFoundError());
        } else {
          res.status(200).json(perm.related("users").toClientJSON());
        }
      });
  },

  addUser: function addUser(req, res, next) {
    var userId = req.body["userId"];
    if (!userId) {
      next(new errors.BadRequestError({}));
    }

    // FIXME: this is very ugly...
    // move this utility to an `addUser` method in permission model
    return models.Permission
      .forge({
        id: req.params.permissionId
      })
      .fetch({
        withRelated: ["users"]
      })
      .then(function(perm) {
        if (!perm) {
          next(new errors.NotFoundError());
        } else {
          var userIds = perm.related("users").toClientJSON().map(function(v) {
            return v["id"];
          });
          //console.log(userIds);
          if (_.includes(userIds, userId)) {
            next(new errors.BadRequestError({
              message: "This user already have the permission."
            }));
          } else {
            return models.User
              .forge({
                id: userId
              })
              .fetch()
              .then(function(user) {
                if (user) {
                  return perm.users().attach(userId)
                    .then(function() {
                      res.status(200).json({});
                    });
                } else {
                  next(new errors.BadRequestError({
                    message: "This user does not exists."
                  }));
                }
              });
          }
        }
      });
  },

  // TODO: move this to an `deleteUser` method in permission model
  // 加入一些getById的帮助方法... 写了好多重复的东西了...
  deleteUser: function deleteUser(req, res, next) {
    var userId = req.params.userId;
    return models.Permission
      .forge({
        id: req.params.permissionId
      })
      .fetch()
      .then(function(perm) {
        if (!perm) {
          // FIXME: 像这种重复了好多次的东西都要直接在model里调error啊!!
          next(new errors.BadRequestError({
            message: "This permission does not exists."
          }));
        } else {
          return perm.users().detach(userId)
            .then(function() {
              res.status(204).json({});
            });
        }
      });
  }
};
