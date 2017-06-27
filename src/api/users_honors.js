var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function updateState(oldstate, newstate) {
  
}

function expandFill(hstate, user) {
  var fill = user.related("fills").get(hstate["fill_id"]);
  if (fill === undefined) {
    return hstate;
  }
  hstate["fill"] = fill.get("content");
  return hstate;
}

module.exports = {
  listHonors: function listHonors(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {withRelated: ["honors", "fills"]}
    })
      .then(function (user) {
        res.status(200).json(_.map(user.getHonorStates(), (hstate) => {return expandFill(hstate, user);}))
      });
  },

  applyHonor: function applyHonor(req, res, next) {
    if (!req.body.hasOwnProperty("honor_id")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`honor_id` field is required."
      }));
    }
    if (!req.body.hasOwnProperty("fill") || !req.body["fill"]) {
      return Promise.reject(new errors.BadRequestError({
        message: "`fill` field is required."
      }));
    }
    return models.User.getById(req.params.userId, {
      fetchOptions: {withRelated: ["honors"]}
    })
      .then(function (user) {
        exist_hids = _.map(user.getHonorStates(), (h) => h["honor_id"]);
        if (_.includes(exist_hids, req.body.honor_id)) {
          return Promise.reject(new errors.BadRequestError({
            message: "Honor with `honor_id`==" + req.body.honor_id + " already applied."
          }));
        }
        // Get the honor
        return models.Honor.getById(req.body.honor_id)
          .then(function (hon) {
            // groups that have quota
            gids = _.map(hon.getGroupQuota(), (s) => s["group_id"])
            if (!_.includes(gids, user.get("group_id"))) {
              // FIXME: validation error type?
              return Promise.reject(new errors.ValidationError({
                message: "You can not apply for this honor. No quota is assigned to your group."
              }));
            }
            // Create the fill object
            return models.Fill.create({
              "form_id": hon.get("form_id"),
              "user_id": req.params.userId,
              "content": JSON.stringify(req.body["fill"])
            }, req.user)
              .then(function(fill) {
                // Get current time
                apply_time = new Date();
                // Create new honor apply state
                return user.honors().attach({
                  honor_id: req.body.honor_id,
                  fill_id: fill.get("id"),
                  apply_time: apply_time,
                  state: "temp" // default state: "temp"
                });
              });
          })
          .then(function() {
            return user.fetch({
              withRelated: ["honors", "fills"]
            })
              .then(function (user) {
                hstate = user.getHonorState(req.body.honor_id);
                res.status(201).json(expandFill(hstate, user));
                // var fill = user.related("fills").get(hstate["fill_id"]);
                // if (fill === undefined) {
                //   return Promise.reject(new errors.NotFoundError({
                //     message: util.format("Fill: `fill_id`(%d) not exists", hstate["fill_id"])
                //   }));
                //   hstate["fill"] = fill["content"];
                //   res.status(201).json(hstate);
                // }
              });
          });
      });
  },

  updateHonor: function updateHonor(req, res, next) {
    // Update the honor applying status, or the table content
    body = _.pick(req.body, ["state", "fill"]);
    if (_.keys(body).length == 0) {
      res.status(304).json();
    }
    // FIXME: as the UserHonorState is not updated and treated as a Model
    //        The `isIn` validation does not work. so... do the validation in the api-logic
    if (body["state"] && !_.includes(["applied", "temp", "success", "fail"], body["state"])) {
      return Promise.reject(new errors.BadRequestError({
        message: "You can just pass `state`==\"applied\"/\"temp\"/\"success\"/\"fail\" to this API."
      }));
    }
    return models.User.getById(req.params.userId,
                        {
                          fetchOptions: {withRelated: ["fills", "honors"]}
                        })
      .then(function(user) {
        // Handle fill change
        start = Promise.resolve(null);
        start = Promise.resolve(null);
        hstate = user.getHonorState(req.params.honorId);
        if (!hstate) {
          return Promise.reject(new errors.NotFoundError({
            message: "This user do not apply for this honor."
          }));
        }
        if (body.hasOwnProperty("fill")) {
          fill_id = hstate["fill_id"];
          start = user.related("fills").get(fill_id).update({
            "content": JSON.stringify(body["fill"])
          });
        }
        return start.then(function() {
          // Handle state change
          if (body["state"]) {
            return user.related("honors")
              .query({where: {honor_id: req.params.honorId}})
              .fetch()
              .then(function(c) {
                if (hstate["state"] == "temp" && body["state"] == "applied") {
                  // FIXME: should `apply_time` be updated every time the fill content is updated?
                  return c.updatePivot({
                    "state": body["state"],
                    "apply_time": new Date()
                  });
                } else {
                  return c.updatePivot({
                    "state": body["state"],
                  });
                }
              });
          }
        })
          .then(function() {
            return user.fetch({withRelated: ["fills", "honors"]})
              .then(function(user) {
                hstate = user.getHonorState(req.params.honorId);
                res.status(201).json(expandFill(hstate, user));
              });
          });;
      });
  },

  updateHonorFill: function updateHonorFill(req, res, next) {
    // Update the honor applying status, or the table content
    body = _.pick(req.body, ["state", "fill"]);
    if (_.keys(body).length == 0) {
      res.status(304).json();
    }
    if (body["state"] && !_.includes(["applied", "temp"], body["state"])) {
      return Promise.reject(new errors.BadRequestError({
        message: "You can just pass `state`==\"applied\"/\"temp\" to this API."
      }));
    }
    return models.User.getById(req.params.userId,
                        {
                          fetchOptions: {withRelated: ["fills", "honors"]}
                        })
      .then(function(user) {
        // Handle fill change
        start = Promise.resolve(null);
        hstate = user.getHonorState(req.params.honorId);
        if (!hstate) {
          return Promise.reject(new errors.NotFoundError({
            message: "This user do not apply for this honor."
          }));
        }
        if (body.hasOwnProperty("fill")) {
          if (hstate["state"] != "temp") {
            return Promise.reject(new errors.BadRequestError({
              message: "You cannot modify the apply form after it is applied."
            }));
          }
          fill_id = hstate["fill_id"];
          start = user.related("fills").get(fill_id).update({
            "content": JSON.stringify(body["fill"])
          });
        }
        return start.then(function() {
          // Handle state change
          if (body["state"]) {
            return user.related("honors")
              .query({where: {honor_id: req.params.honorId}})
              .fetch()
              .then(function(c) {
                if (hstate["state"] == "temp" && body["state"] == "applied") {
                  // FIXME: should `apply_time` be updated every time the fill content is updated?
                  return c.updatePivot({
                    "state": body["state"],
                    "apply_time": new Date()
                  });
                } else {
                  return c.updatePivot({
                    "state": body["state"],
                  });
                }
              });
          }
        })
          .then(function() {
            return user.fetch({withRelated: ["fills", "honors"]})
              .then(function(user) {
                hstate = user.getHonorState(req.params.honorId);
                res.status(201).json(expandFill(hstate, user));
              });
          });
      });
  },

  deleteHonor: function deleteHonor(req, res, next) {
  },
};
