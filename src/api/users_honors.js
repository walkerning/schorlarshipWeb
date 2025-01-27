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
    return models.Honor.getById(req.params.honorId).then(function(hon) {
      var hon_year = _.toNumber(hon.get("year"));
      var now_year = (new Date()).getFullYear();
      if (hon_year !== now_year) {
        return Promise.reject(new errors.ValidationError({
          message: util.format("Honor `%d` is of year %s, its allocation cannot be updated now (year %s).",
                               req.params.honorId, hon_year, now_year)
        }));
      }
      return fn(req, res, next);
    });
  };
}

module.exports = {
  listHonors: function listHonors(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["applyHonors", "fills"]
      }
    })
      .then(function(user) {
        return user.getHonorStatesCol(req.query)
          .then(function(hstates) {
            res.status(200).json(_.map(hstates, (hstate) => {
              return expandFill(hstate, user);
            }))
          });
      });
  },

  applyHonor: function applyHonor(req, res, next) {
    if (!req.body.hasOwnProperty("honor_id")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`honor_id` field is required."
      }));
    }
    // Attention: ids in the request body is of string type
    //            Maybe get the honor first. and use honor.get("id") instead is better
    req.body.honor_id = _.toNumber(req.body.honor_id);
    if (!req.body.hasOwnProperty("fill") || !req.body["fill"]) {
      return Promise.reject(new errors.BadRequestError({
        message: "`fill` field is required."
      }));
    }
    return models.User.getById(req.params.userId, {
      fetchOptions: {
        withRelated: ["applyHonors", "applyReasons"]
      }
    })
      .then(function(user) {
        // Judge if this user have submitted apply reason this year.
        var now_year = (new Date()).getFullYear();
        return user.getReasonState(now_year)
          .then(function (s) {
            if (s == null) {
              return Promise.reject(new errors.ValidationError({
                message: util.format("You cannot apply for honors before submitting apply reasons(申请理由) for this year `%d`", now_year)
              }));
            }
            var exist_hids = _.map(user.getHonorStates(), (h) => h["honor_id"]);
            if (_.includes(exist_hids, req.body.honor_id)) {
              return Promise.reject(new errors.BadRequestError({
                message: "Honor with `honor_id`==" + req.body.honor_id + " already applied."
              }));
            }
            // Get the honor
            return models.Honor.getById(req.body.honor_id)
              .then(function(hon) {
                if (!hon) {
                  return Promise.reject(new errors.BadRequestError({
                    message: "Honor with `honor_id`==" + req.body.honor_id + " does not exist."
                  }));
                }
                // groups that have quota
                var gids = _.map(hon.getGroupQuota(), (s) => s["group_id"])
                if (!_.includes(gids, user.get("group_id"))) {
                  // FIXME: validation error type?
                  return Promise.reject(new errors.ValidationError({
                    message: "You can not apply for this honor. No quota is assigned to your group."
                  }));
                }
                // Get current time
                var start_time = new Date(hon.get("start_time"));
                var end_time = new Date(hon.get("end_time"));
                var apply_time = new Date();
                if (!(start_time <= apply_time && apply_time <= end_time &&
                      apply_time.getFullYear() == _.toNumber(hon.get("year")))) {
                  return Promise.reject(new errors.BadRequestError({
                    message: "You can not apply for this honor. The honor is not open now."
                  }));
                }
                // Create the fill object
                return models.Fill.create({
                  "form_id": hon.get("form_id"),
                  "user_id": req.params.userId,
                  "content": JSON.stringify(req.body["fill"])
                }, req.user)
                  .then(function(fill) {
                    // Create new honor apply state
                    return models.UserHonorState.create({
                      user_id: req.params.userId,
                      honor_id: req.body.honor_id,
                      fill_id: fill.get("id"),
                      apply_time: apply_time,
                      state: "temp" // default state: "temp"
                    }, req.user)
                      .then(function(hon) {
                        return fill.update({"user_honor_id": hon.get("id")}, req.user);
                      });
                  });
              })
              .then(function() {
                return user.fetch({
                  withRelated: ["applyHonors", "fills"]
                })
                  .then(function(user) {
                    return user.getHonorState(req.body.honor_id)
                      .then(function(hstate) {
                        res.status(201).json(expandFill(hstate, user));
                      });
                  });
              });
          });
      });
  },

  cancelHonor: permitUpdateCurrentYear(function cancelHonor(req, res, next) {
    return models.User.getById(req.params.userId,
      {
        fetchOptions: {
          withRelated: ["fills", "applyHonors"]
        }
      })
      .then(function(user) {
        // Handle fill change
        return user.getHonorStateModel(req.params.honorId)
          .then(function(state) {
            var start = Promise.resolve(null);
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not apply for this honor."
              }));
            }
            var hstate = state.toJSON();
            if (_.includes(["applied", "temp"], hstate["states"])) {
              return Promise.reject(new errors.BadRequestError({
                message: "You can only cancel honor application in temp or applied."
              }));
            }
            return state.destroy().then(function() {
              res.status(204).json({}).end();
            });
          })
      });
  }),

  updateHonor: permitUpdateCurrentYear(function updateHonor(req, res, next) {
    // Update the honor applying status, or the table content
    var body = _.pick(req.body, ["state", "fill"]);
    if (_.keys(body).length == 0) {
      return res.status(304).json();
    }
    return models.User.getById(req.params.userId,
      {
        fetchOptions: {
          withRelated: ["fills", "applyHonors"]
        }
      })
      .then(function(user) {
        // Handle fill change
        return user.getHonorStateModel(req.params.honorId)
          .then(function(state) {
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not apply for this honor."
              }));
            }
            var hstate = state.toJSON();
            return bookshelfInst.transaction(function(trans) {
              return models.Honor.getById(req.params.honorId).then(function(hon) {
                var start = Promise.resolve(null);
                if (body["state"] && body["state"] == "success" && hstate["state"] !== "success") {
                  // Judge the allocation count not exceed the group quota.
                  start = hon.allocatedCountOfGroup(user.get("group_id"))
                    .then(function (count) {
                      var group_quota = hon.getQuotaOfGroup(user.get("group_id"));
                      if (count >= group_quota) {
                        // Exceeded, return error.
                        return Promise.reject(new errors.ValidationError({
                          message: util.format("Allocated count `%d` already exceeds quota `%d`.", count, group_quota)
                        }));
                      }
                    });
                }
                if (body.hasOwnProperty("fill")) {
                  var fill_id = hstate["fill_id"];
                  // Update the fill of the apply form
                  start = start.then(function() {
                    user.related("fills").get(fill_id).update({
                      "content": JSON.stringify(body["fill"])
                    }, req.user);
                  });
                }
                return start.then(function() {
                  // Handle state change
                  var start_ = Promise.resolve(null);
                  if (body["state"]) {
                    if ((body["state"] == "success" && hstate["state"] !== "success") ||
                        (hstate["state"] == "success" && body["state"] !== "success")) {
                      // If state change is an add/delete of success, clear all the scholarships
                      // of the current year that have been allocated to this user
                      start_ = user.removeScholarsOfYear((new Date()).getFullYear());
                    }
                    return start_.then(() => {
                      state.update({
                        "state": body["state"]
                      }, req.user);
                    });
                  }
                });
              });
            });
          })
          .then(function() {
            return user.fetch({
              withRelated: ["fills", "applyHonors"]
            })
              .then(function(user) {
                return user.getHonorState(req.params.honorId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  }),

  updateHonorFill: permitUpdateCurrentYear(function updateHonorFill(req, res, next) {
    // Update the honor applying status, or the table content
    var body = _.pick(req.body, ["state", "fill"]);
    if (_.keys(body).length == 0) {
      return res.status(304).json();
    }
    if (!_.includes(["applied", "temp"], body["state"])) {
      return Promise.reject(new errors.BadRequestError({
        message: "You can just pass `state`==\"applied\"/\"temp\" to this API."
      }));
    }
    return models.User.getById(req.params.userId,
      {
        fetchOptions: {
          withRelated: ["fills", "applyHonors"]
        }
      })
      .then(function(user) {
        // Handle fill change
        return user.getHonorStateModel(req.params.honorId)
          .then(function(state) {
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not apply for this honor."
              }));
            }
            var hstate = state.toJSON();
            if (hstate["state"] != "temp") {
              return Promise.reject(new errors.BadRequestError({
                message: "You cannot modify the apply form after it is applied."
              }));
            }
            return models.Honor.getById(req.params.honorId).then(function(hon) {
              // Get current time
              var start_time = new Date(hon.get("start_time"));
              var end_time = new Date(hon.get("end_time"));
              var apply_time = new Date();
              if (!(start_time <= apply_time && apply_time <= end_time)) {
                return Promise.reject(new errors.BadRequestError({
                  message: "You can not update related states of this honor. The honor is not open now."
                }));
              }
              var fill_id = hstate["fill_id"];
              return user.related("fills").get(fill_id).update({
                "content": JSON.stringify(body["fill"])
              }).then(function() {
                // Handle state change
                return state.update({
                  "state": body["state"],
                  "apply_time": apply_time
                });
              });
            });
          })
          .then(function() {
            return user.fetch({
              withRelated: ["fills", "applyHonors"]
            })
              .then(function(user) {
                return user.getHonorState(req.params.honorId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  }),

  addHonorScore: permitUpdateCurrentYear(function addHonorScore(req, res, next) {
    if (!req.body.hasOwnProperty("score")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`score` field is required."
      }));
    }
    return models.UserHonorState.getUserHonorState(req.params.userId, req.params.honorId)
      .then(function(st) {
        if (!st) {
          // FIXME: BadRequestError or NotFoundError???
          return Promise.reject(new errors.BadRequestError({
            message: util.format("This user %s has not applied for this honor %s.", req.params.userId, req.params.honorId)
          }));
        }
        return st.addScore(req.user, JSON.stringify(req.body.score))
          .then(function() {
            st.fetch()
              .then(function(st) {
                // FIXME: TODO: also inlining fill here?
                res.status(201).json(st.toJSON());
              });
          });
      });
  }),

  updateHonorScore: permitUpdateCurrentYear(function updateHonorScore(req, res, next) {
    if (!req.body.hasOwnProperty("score")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`score` field is required."
      }));
    }
    return models.UserHonorState.getUserHonorState(req.params.userId, req.params.honorId)
      .then(function(st) {
        if (!st) {
          // FIXME: BadRequestError or NotFoundError???
          return Promise.reject(new errors.BadRequestError({
            message: util.format("This user %s has not applied for this honor %s.", req.params.userId, req.params.honorId)
          }));
        }
        return st.updateScore(req.user, JSON.stringify(req.body.score))
          .then(function() {
            st.fetch()
              .then(function(st) {
                res.status(201).json(st.toJSON());
              });
          });
      });
  }),

  deleteHonorScore: permitUpdateCurrentYear(function deleteHonorScore(req, res, next) {
    return models.UserHonorState.getUserHonorState(req.params.userId, req.params.honorId)
      .then(function(st) {
        if (!st) {
          // FIXME: BadRequestError or NotFoundError???
          return Promise.reject(new errors.BadRequestError({
            message: util.format("This user %s has not applied for this honor %s.", req.params.userId, req.params.honorId)
          }));
        }
        return st.deleteScore(req.user)
          .then(function() {
            st.fetch()
              .then(function(st) {
                res.status(204).json({});
              });
          });
      });
  })
};
