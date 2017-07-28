var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")

module.exports={
  list:function list(req, res, next) {
    var queries = req.query;
    return models.Honors.getByQuery(queries)
      .then(function(collection) {
        res.status(200).json(collection.toClientJSON());
      })
  },

  info: function info(req, res, next) {
    return models.Honor
      .getById(req.params.honorId, {fetchOptions: {withRelated: ["groups"]}})
      .then(function(honor) {
          res.status(200).json(honor.toClientJSON());
      })

  },

  create: function create(req, res, next) {
    return models.Honor.create(req.body, req.user)
      .then(function(hon) {
        res.status(201).json(hon.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.Honor.getById(req.params.honorId)
      .then(function(hon) {
        return hon.update(req.body, req.user)
          .then(function() {
            return hon.fetch()
              .then(function(hon) {
                res.status(200).json(hon.toClientJSON());
              });
          });
      });
  },

  delete: function _delete(req, res, next) {
    return models.Honor.getById(req.params.honorId, {
      noreject: true
    })
      .then(function(honor) {
        var start = Promise.resolve(null);
        if (honor) {
          start = honor.destroy();
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  }
}
