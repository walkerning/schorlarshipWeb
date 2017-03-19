var _ = require("lodash");
var models = require("../models");
var schema = require("../data").schema;
var errors = require("../errors");

module.exports = {
  list: function(req, res, next) {
    return models.Users.forge().fetch({
      withRelated: ["permissions", "group"]
    })
      .then(function(collection) {
        res.json(collection.toClientJSON());
      });
  },
  create: function(req, res, next) {
    // FIXME: this filtering is a little awkward...
    var fields = req.user.permittedUpdateAttributes(req.user);
    return models.User.forge(_.pick(req.body, fields))
      .save({}, {
        context: {
          contextUser: req.user
        }
      })
      .then(function(user) {
        res.json(user.toClientJSON());
      });
  },

  info: function(req, res, next) {
    return models.User.forge({
      id: req.params.userId
    })
      .fetch()
      .then(function(user) {
        if (!user) {
          next(new errors.NotFoundError());
        } else {
          res.json(user.toClientJSON());
        }
      });
  },

  updateInfo: function(req, res, next) {
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
              res.json(user.toClientJSON());
            });
        }
      });
  },

  delete: function(req, res, next) {
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

