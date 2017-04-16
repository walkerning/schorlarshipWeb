var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    return models.Groups.forge()
      .fetch()
      .then(function(collection) {
        res.json(collection.toClientJSON());
      });
  },

  create: function create(req, res, next) {
    return models.Group.create(req.body, req.user)
      .then(function(grp) {
        res.status(201).json(grp.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.Group.getById(req.params.groupId)
      .then(function(grp) {
        grp.update(req.body, req.user)
          .then(function() {
            return models.Group.getById(req.params.groupId)
              .then(function(grp) {
                res.status(200).json(grp.toClientJSON());
              });
          });
      });
  }
};
