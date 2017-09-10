var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")

function listAll(req, res, next) {
  var queries = req.query;
  return models.Reasons.getByQuery(queries, {})
    .then(function(collection) {
      var obj = collection.toClientJSON();
      res.status(200).json(obj);
    });
}

function listPage(req, res, next) {
  var queries = req.query;
  if (!(queries.hasOwnProperty("page") && queries.hasOwnProperty("pageSize"))) {
    return Promise.reject(new errors.BadRequestError({
      message: "`page` and `pageSize` field is required."
    }));
  }
  page = _.toInteger(queries["page"]);
  pageSize = _.toInteger(queries["pageSize"]);
  return models.Reasons.getByQuery(queries, {})
    .then(function(collection) {
      var obj = collection.toClientJSON();
      var pagination = {
        page: page,
        pageSize: pageSize,
        rowCount: obj.length,
        pageCount: Math.ceil(obj.length / pageSize)
      }
      res.status(200).json({
        data: obj.slice((page - 1) * pageSize, page * pageSize),
        pagination: pagination
      });
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

  info: function info(req, res, next) {
    return models.Reason
      .getById(req.params.reasonId, {})
      .then(function(rea) {
        res.status(200).json(rea.toClientJSON());
      })

  },

  create: function create(req, res, next) {
    return models.Reason.create(req.body, req.user)
      .then(function(rea) {
        res.status(201).json(rea.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.Reason.getById(req.params.reasonId)
      .then(function(rea) {
        return rea.update(req.body, req.user)
          .then(function() {
            return models.Reason.forge({
              "year": rea.get("year")
            }).fetch()
              .then(function(rea) {
                res.status(200).json(rea.toClientJSON());
              });
          });
      });
  },

  delete: function _delete(req, res, next) {
    return models.Reason.getById(req.params.reasonId, {
      noreject: true
    })
      .then(function(rea) {
        var start = Promise.resolve(null);
        if (rea) {
          start = rea.destroy();
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  }
}
