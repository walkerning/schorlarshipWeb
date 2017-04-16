var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    var queries = req.query;
    return models.Forms.getByQuery(queries)
      .then(function(collection) {
        res.status(200).json(collection.toClientJSON());
      });
  },

  create: function create(req, res, next) {
    var body = req.body;
    if (body.fields !== undefined) {
      body.fields = JSON.stringify(body.fields);
    }
    return models.Form.create(body, req.user)
      .then(function(form) {
        res.status(201).json(form.toClientJSON());
      });
  },

  info: function info(req, res, next) {
    return models.Form.getById(req.params.formId)
      .then(function(form) {
        res.status(200).json(form.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.Form.getById(req.params.formId)
      .then(function(form) {
        return form.update(req.body, req.user)
          .then(function() {
            return models.Form.getById(req.params.formId)
              .then(function(form) {
                res.status(200).json(form.toClientJSON());
              });
          });
      });
  },

  delete: function _delete(req, res, next) {
    return models.Form.getById(req.params.formId, {
      noreject: true
    })
      .then(function(form) {
        var start = Promise.resolve(null);
        if (form) {
          start = form.destroy();
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  }
};
