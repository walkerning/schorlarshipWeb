var _ = require("lodash");
var Promise = require("bluebird");
var util = require("util");
var models = require("../models");
var errors = require("../errors");
var bookshelfInst = require("../models/base");

function expandFill(hstate, user) {
  var fill = user.related("fills").get(hstate["fill_id"]);
  if (fill === undefined) {
    return hstate;
  }
  hstate["fill"] = fill.get("content");
  return hstate;
}

function permitUpdateCurrentYear(fn) {
  return function(req, res, next) {
    return models.Reason.getById(req.params.reasonId).then(function(rea) {
      var rea_year = _.toNumber(rea.get("year"));
      var now_year = (new Date()).getFullYear();
      if (rea_year !== now_year) {
        return Promise.reject(new errors.ValidationError({
          message: util.format("Reason `%d` is of year %s, cannot update it now (year %s).",
            req.params.reasonId, rea_year, now_year)
        }));
      }
      return fn(req, res, next);
    });
  };
}

module.exports = {
  listReasons: function listReasons(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["applyReasons", "fills"]
      }
    })
      .then(function(user) {
        return user.getReasonStatesCol(req.query)
          .then(function(hstates) {
            res.status(200).json(_.map(hstates, (hstate) => {
              return expandFill(hstate, user);
            }))
          });
      });
  },

  applyReason: function applyReason(req, res, next) {
    if (!req.body.hasOwnProperty("reason_id")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`reason_id` field is required."
      }));
    }
    req.body.reason_id = _.toNumber(req.body.reason_id);
    if (!req.body.hasOwnProperty("fill") || !req.body["fill"]) {
      return Promise.reject(new errors.BadRequestError({
        message: "`fill` field is required."
      }));
    }
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["applyReasons"]
      }
    })
      .then(function(user) {
        exist_hids = _.map(user.getReasonStates(), (h) => h["year"]);
        if (_.includes(exist_hids, req.body.reason_id)) {
          return Promise.reject(new errors.BadRequestError({
            message: "Reason with `year`==" + req.body.reason_id + " already applied."
          }));
        }
        // Get the reason
        return models.Reason.getById(req.body.reason_id)
          .then(function(rea) {
            if (!rea) {
              return Promise.reject(new errors.BadRequestError({
                message: "Reason with `year`==" + req.body.reason_id + " does not exist."
              }));
            }
            // Get current time
            apply_time = new Date();
            var rea_year = _.toNumber(rea.get("year"));
            if (!(apply_time.getFullYear() == rea_year)) {
              return Promise.reject(new errors.BadRequestError({
                message: util.format("You can not submit reason of `year`==%d. The reason is not open now.", rea_year)
              }));
            }
            // Create the fill object
            return models.Fill.create({
              "form_id": rea.get("form_id"),
              "user_id": req.params.userId,
              "content": JSON.stringify(req.body["fill"])
            }, req.user)
              .then(function(fill) {
                // Create new reason apply state
                return models.UserReasonState.create({
                  user_id: req.params.userId,
                  year: req.body.reason_id,
                  fill_id: fill.get("id"),
                  apply_time: apply_time,
                }, req.user);
              });
          })
          .then(function() {
            return user.fetch({
              withRelated: ["applyReasons", "fills"]
            })
              .then(function(user) {
                return user.getReasonState(req.body.reason_id)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  },

  updateReasonFill: permitUpdateCurrentYear(function updateReasonFill(req, res, next) {
    // Update the reason applying status, or the table content
    var body = _.pick(req.body, ["fill"]);
    if (_.keys(body).length == 0) {
      return res.status(304).json();
    }
    return models.User.getById(req.params.userId,
      {
        fetchOptions: {
          withRelated: ["fills", "applyReasons"]
        }
      })
      .then(function(user) {
        // Handle fill change
        return user.getReasonStateModel(req.params.reasonId)
          .then(function(state) {
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not submit this reason."
              }));
            }
            hstate = state.toJSON();
            return models.Reason.getById(req.params.reasonId).then(function(rea) {
              fill_id = hstate["fill_id"];
              var apply_time = new Date();
              return user.related("fills").get(fill_id).update({
                "content": JSON.stringify(body["fill"])
              }).then(function() {
                // Handle state change
                return state.update({
                  "apply_time": apply_time
                });
              });
            });
          })
          .then(function() {
            return user.fetch({
              withRelated: ["fills", "applyReasons"]
            })
              .then(function(user) {
                return user.getReasonState(req.params.reasonId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  })
};
