var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")

function listAll(req, res, next) {
  return models.Scholars.getByQuery(req.query)
    .then(function(scholars){
      res.status(200).json(scholars.toClientJSON());
    })
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
  return models.Scholars.getByQuery(queries)
    .then(function(scholars){
      var obj = scholars.toClientJSON();
      var pagination = {
        page: page,
        pageSize: pageSize,
        rowCount: obj.length,
        pageCount: Math.ceil(obj.length / pageSize)
      }
      res.status(200).json({ data: obj.slice((page - 1) * pageSize, page * pageSize), pagination: pagination});
    })    
}

module.exports={
  list: function (req, res, next) {
    if (req.query.hasOwnProperty("page")) {
      return listPage(req, res, next);
    } else {
      return listAll(req, res, next);
    }
  },
    
  info: function (req, res, next) {
    return models.Scholar
      .getById(req.params.scholarId, {fetchOptions: {withRelated: ["groups"]}})
      .then(function(scholar) {
        res.status(200).json(scholar.toClientJSON());
      })
  },
    
  create: function (req, res, next) {
    return models.Scholar.create(req.body,req.user)
      .then(function (scholar) {
        res.status(201).json(scholar.toClientJSON())
      })
  },
    
  updateInfo: function (req, res, next) {
    return models.Scholar.getById(req.params.scholarId)
      .then(function(scholar){
        return scholar.update(req.body, req.user)
          .then(function (scholar) {
            res.status(200).json(scholar)
          })
      })
  },
    
  delete: function (req, res, next) {
    return models.Scholar.getById(req.params.scholarId, { noreject: true })
      .then(function (scholar) {
        var start = Promise.resolve(null);
        if (scholar) {
          start = scholar.destroy();
        }
        return start.then(function () {
          res.status(200).json({}).end();
        })
      })
  }
};