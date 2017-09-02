var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var models = require("../models");
var errors = require("../errors");
var bookshelfInst = require("../models/base");

function listAll(req, res, next) {
  var queries = req.query;
  return models.Forms.getByQuery(queries)
    .then(function(collection) {
      res.status(200).json(collection.toClientJSON());
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
  page = _.toInteger(queries["page"]);
  pageSize = _.toInteger(queries["pageSize"]);
  return models.Forms.getByQuery(queries)
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
    var body = req.body;
    if (body.fields !== undefined) {
      body.fields = JSON.stringify(body.fields);
    }

    return bookshelfInst.transaction(function(trans) {
      return models.Form.getById(req.params.formId)
        .then(function(form) {
          // If there already exists fills that using this form, do not allow modification.
          return form.fills().count().then(function(cnt) {
            if (cnt > 0) {
              // Return error
              return Promise.reject(new errors.ValidationError({
                message: util.format("Form `%d` already used by %d fills, cannot update this form. You might want to create a new form.", req.params.formId, cnt)
              }));
            }
            return form.update(body, req.user)
              .then(function() {
                return form.fetch()
                  .then(function(form) {
                    res.status(200).json(form.toClientJSON());
                  });
              });
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
