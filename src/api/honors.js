var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")

function listAll(req, res, next) {
  var queries = req.query;
  return models.Honors.getByQuery(queries, {
    fetchOptions: {
      withRelated: ["groups"]
    }
  })
    .then(function(collection) {
      var obj = collection.toClientJSON();
      // Query "?group_id=" return all honors that have quota in this group
      if ("group_id" in queries) {
        obj = _.filter(obj, (value) => {
          var group_ids = _.map(value["group_quota"], (s) => s["group_id"]);
          return _.includes(group_ids, _.toNumber(queries["group_id"]));
        });
      }
      // Query "?available=1" return all honors that the current time is between its start_time and end_time
      if ("available" in queries && _.toInteger(queries["available"])) {
        var now = new Date();
        obj = _.filter(obj, (value) => {
          var start = new Date(value["start_time"]);
          var end = new Date(value["end_time"]);
          return start <= now && now <= end;
        });
      }
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
  var page = _.toInteger(queries["page"]);
  var pageSize = _.toInteger(queries["pageSize"]);
  return models.Honors.getByQuery(queries, {
    fetchOptions: {
      withRelated: ["groups"]
    }
  })
    .then(function(collection) {
      var obj = collection.toClientJSON();
      // Query "?group_id=" return all honors that have quota in this group
      if ("group_id" in queries) {
        obj = _.filter(obj, (value) => {
          var group_ids = _.map(value["group_quota"], (s) => s["group_id"]);
          return _.includes(group_ids, _.toNumber(queries["group_id"]));
        });
      }
      // Query "?available=1" return all honors that the current time is between its start_time and end_time
      if ("available" in queries && _.toInteger(queries["available"])) {
        var now = new Date();
        obj = _.filter(obj, (value) => {
          var start = new Date(value["start_time"]);
          var end = new Date(value["end_time"]);
          return start <= now && now <= end;
        });
      }
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
    return models.Honor
      .getById(req.params.honorId, {
        fetchOptions: {
          withRelated: ["groups"]
        }
      })
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
            return models.Honor.forge({
              "id": hon.get("id")
            }).fetch()
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
