var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var models = require("../models");
var errors = require("../errors");

module.exports = {
  list: function list(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["fills"]
      }
    })
      .then(function(user) {
        res.status(200).json(user.related("fills").toJSON());
      });
  },

  create: function create(req, res, next) {
    var body = req.body;
    if (body.content !== undefined) {
      body.content = JSON.stringify(body.content);
    }
    body.user_id = req.user.get("id");
    return models.Fill.create(body, req.user)
      .then(function(fill) {
        res.status(201).json(fill.toClientJSON());
      });
  },

  info: function info(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["fills"]
      }
    })
      .then(function(user) {
        var fill = user.related("fills").get(req.params.fillId);
        if (fill === undefined) {
          return Promise.reject(new errors.NotFoundError({
            message: util.format("`id`(%s) not exists", req.params.fillId)
          }));
        }
        res.status(200).json(fill.toJSON());
      });
  },

  updateInfo: function updateInfo(req, res, next) {
    var body = req.body;
    if (body.content !== undefined) {
      body.content = JSON.stringify(body.content);
    }
    // logic: no one cannot update `user_id` explicitly.
    // `fill.user_id` is determined by the context user only.
    body.user_id = req.user.get("id");
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["fills"]
      }
    })
      .then(function(user) {
        var fill = user.related("fills").get(req.params.fillId);
        if (fill === undefined) {
          return Promise.reject(new errors.NotFoundError({
            message: util.format("`id`(%s) not exists")
          }));
        }
        return fill.update(body, req.user)
          .then(function() {
            return fill.fetch()
              .then(function(fill) {
                res.status(200).json(fill.toJSON());
              });
          });
      });
  },

// delete: function _delete(req, res, next) {
//   return models.Form.getById(req.params.formId, {
//     noreject: true
//   })
//     .then(function(form) {
//       var start = Promise.resolve(null);
//       if (form) {
//         start = form.destroy();
//       }
//       return start.then(function() {
//         res.status(204).json({}).end();
//       });
//     });
// }
};
