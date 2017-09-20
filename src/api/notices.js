var _ = require("lodash");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var util = require("util");
var path = require("path");
var multiparty = Promise.promisifyAll(require('multiparty'), {
  multiArgs: true
});
var hash = require('object-hash');
var errors = require("../errors");
var models = require("../models")
var logging = require("../logging")
var santitize = require("sanitize-filename");

function listAll(req, res, next) {
  var queries = req.query;
  return models.Notices.getByQuery(queries, {})
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
  var page = _.toInteger(queries["page"]);
  var pageSize = _.toInteger(queries["pageSize"]);
  return models.Notices.getByQuery(queries, {})
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
    return models.Notice
      .getById(req.params.noticeId, {})
      .then(function(not) {
        res.status(200).json(not.toClientJSON());
      });
  },

  create: function create(req, res, next) {
    return models.Notice.create(req.body, req.user)
      .then(function(not) {
        res.status(201).json(not.toClientJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    return models.Notice.getById(req.params.noticeId)
      .then(function(not) {
        return not.update(req.body, req.user)
          .then(function() {
            return not.fetch()
              .then(function(not) {
                res.status(200).json(not.toClientJSON());
              });
          });
      });
  },

  uploadAttachment: function uploadAttachment(req, res, next) {
    // Must exists!
    var attachment_basename = process.env.ATTACHMENT_BASENAME;
    if (!attachment_basename) {
      return Promise.reject(new errors.InternalServerError());
    }
    return models.Notice.getById(req.params.noticeId)
      .then(function(not) {
        var start = Promise.resolve(null);
        if (not.get("attachment_name")) {
          // Remove original attachment
          start = start.then(() => {
            return fs.unlinkAsync(path.join(attachment_basename, not.get("attachment_hash") + "." + not.get("suffix")))
              .catch((err) => {
                if (err && err.code == "ENOENT") {
                  return null;
                }
                throw err;
              });
          });
        }
        return start.then(() => {
          var form = new multiparty.Form();
          return form.parseAsync(req).then((arr) => {
            var err = arr[0];
            if (_.keys(err).length) {
              // FIXME: validation error or internal server error?
              logging.error(err);
              return Promise.reject(new errors.ValidationError({
                message: "Parse file upload request fail."
              }));
            }
            var files = arr[1]["file"][0];
            var santitized_fname = santitize(files["originalFilename"]);
            var hashed_fname = hash({
              "name": santitized_fname,
              "time": new Date()
            });
            var _last_index = santitized_fname.lastIndexOf(".")
            var suffix = "txt";
            if (_last_index >= 0) {
              suffix = santitized_fname.slice(_last_index + 1);
            }
            console.log("suffix: ", suffix, "\nhashed: ", hashed_fname)
            return fs.renameAsync(files["path"], path.join(attachment_basename, hashed_fname + "." + suffix))
              .then(() => {
                return not.update({
                  "attachment_hash": hashed_fname,
                  "attachment_name": santitized_fname,
                  "suffix": suffix
                }, req.user, true);
              });
          });
        })
          .then(() => {
            return not.fetch()
              .then(function(not) {
                res.status(200).json(not.toClientJSON());
              });
          });
      });
  },

  deleteAttachment: function deleteAttachment(req, res, next) {
    var attachment_basename = process.env.ATTACHMENT_BASENAME;
    if (!attachment_basename) {
      return Promise.reject(new errors.InternalServerError());
    }
    return models.Notice.getById(req.params.noticeId)
      .then(function(not) {
        var start = Promise.resolve(null);
        if (not.get("attachment_name")) {
          // Remove attachment
          start = start.then(() => {
            return fs.unlinkAsync(path.join(attachment_basename, not.get("attachment_hash") + "." + not.get("suffix")))
              .catch((err) => {
                if (err && err.code == "ENOENT") {
                  return null;
                }
                throw err;
              });
          });
        }
        return start.then(() => {
          return not.update({
            "attachment_name": null,
            "attachment_hash": null,
            "suffix": null
          }, req.user, true);
        })
          .then(() => {
            return not.fetch()
              .then(function(not) {
                res.status(200).json(not.toClientJSON());
              });y
          });
      });
  },

  delete: function _delete(req, res, next) {
    var attachment_basename = process.env.ATTACHMENT_BASENAME;
    if (!attachment_basename) {
      return Promise.reject(new errors.InternalServerError());
    }
    return models.Notice.getById(req.params.noticeId, {
      noreject: true
    })
      .then(function(not) {
        var start = Promise.resolve(null);
        if (not) {
          if (not.get("attachment_name")) {
            // Remove attachment
            start = fs.unlinkAsync(path.join(attachment_basename, not.get("attachment_hash") + "." + not.get("suffix")))
              .catch((err) => {
                if (err && err.code == "ENOENT") {
                  return null;
                }
                throw err;
              });
          }
          start = start.then(() => {
            not.destroy()
          });
        }
        return start.then(function() {
          res.status(204).json({}).end();
        });
      });
  }
}
