var _ = require("lodash");
var models = require("../models");
var schema = require("../data").schema;
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    var queries = req.query;
    //console.log(queries);
    return models.Users.forge()
      .query({
        where: _.pick(queries, models.User.queriableAttributes())
      })
      .fetch()
      .then(function(collection) {
        var obj = collection.toClientJSON();
        if ("group" in queries) {
          obj = _.filter(obj, (value) => {
            return value["group"].name == queries["group"]
          });
        }
        res.status(200).json(obj);
      });
  },
  create: function create(req, res, next) {
    // FIXME: this filtering is a little awkward...
    var fields = req.user.permittedUpdateAttributes(req.user);
    return models.User.forge(_.pick(req.body, fields))
      .save({}, {
        context: {
          contextUser: req.user
        }
      })
      .then(function(user) {
        res.status(201).json(user.toClientJSON());
      });
  },

  info: function info(req, res, next) {
    return models.User.forge({
      id: req.params.userId
    })
      .fetch()
      .then(function(user) {
        if (!user) {
          next(new errors.NotFoundError());
        } else {
          res.status(200).json(user.toClientJSON());
        }
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.User.forge({
      id: req.params.userId
    })
      .fetch()
      .then(function(user) {
        if (!user) {
          next(new errors.NotFoundError());
        } else {
          var fields = user.permittedUpdateAttributes(req.user);
          return user.save(_.pick(req.body, fields),
            {
              context: {
                contextUser: req.user
              }
            })
            .then(function() {
              res.status(200).json(user.toClientJSON());
            });
        }
      });
  },

  // TODO: 改成设置active标签
  //       并且不返回错误, 保持DELETE操作的幂等性
  delete: function _delete(req, res, next) {
    return models.User.forge({
      id: req.params.userId
    })
      .fetch()
      .then(function(user) {
        if (!user) {
          next(new errors.NotFoundError());
        } else {
          return user.destroy()
            .then(function() {
              res.status(204).json({}).end();
            });
        }
      });
  }
};

