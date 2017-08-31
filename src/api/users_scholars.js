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

module.exports = {
  listScholars: function listScholars(req, res, next) {
    return models.User.getById(req.params.userId, {
      fetchOptions: {withRelated: ["applyScholars", "fills"]}
    })
      .then(function (user) {
        return user.getScholarStatesCol(req.query)
          .then(function (hstates) {
            res.status(200).json(_.map(hstates, (hstate) => {return expandFill(hstate, user);}))
          });
      });
  },

  giveScholar: function giveScholar(req, res, next) {
    if (!req.body.hasOwnProperty("scholar_id")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`scholar_id` field is required."
      }));
    }
    req.body.scholar_id = _.toNumber(req.body.scholar_id);
    return models.User.getById(req.params.userId, {
      fetchOptions: {withRelated: ["applyScholars"]}
    })
      .then(function (user) {
        exist_hids = _.map(user.getScholarStates(), (h) => h["scholar_id"]);
        if (_.includes(exist_hids, req.body.scholar_id)) {
          return Promise.reject(new errors.BadRequestError({
            message: "Scholar with `scholar_id`==" + req.body.scholar_id + " already applied."
          }));
        }
        // Get the scholar
        return bookshelfInst.transaction(function (trans) {
          return models.Scholar.getById(req.body.scholar_id)
            .then(function (scholar) {
              // groups that have quota
              gids = _.map(scholar.getGroupQuota(), (s) => s["group_id"])
              if (!_.includes(gids, user.get("group_id"))) {
                // FIXME: validation error type?
                return Promise.reject(new errors.ValidationError({
                  message: "You can not add this scholar. No quota is assigned to his group."
                }));
              }
              if (scholar.get("alloc") == "money" && !req.body.hasOwnProperty("money")) {
                return Promise.reject(new errors.ValidationError({
                  message: "You should specify `money` in this kind of scholarship."
                }));
              }
              if (req.body.hasOwnProperty("money")) {
                req.body.money = _.toNumber(req.body.money);
              } else {
                req.body.money = null;
              }
              // Judge if the allocated money or the allocated quota exceeds the group quota.
              var start = Promise.resolve(null);
              var group_quota = scholar.getQuotaOfGroup(user.get("group_id"));
              var added = 1;
              if (scholar.get("alloc") == "money") {
                // money alloc
                start = scholar.allocatedMoney();
                added = req.body.money;
              } else {
                // quota alloc
                start = scholar.allocatedCount();
              }
              // Create new scholar state
              return start.then(function (allocated) {
                if (allocated + added > group_quota) {
                  // Exceeded, return error.
                  return Promise.reject(new errors.ValidationError({
                    message: util.format("Allocated `%d` will exceeds quota `%d`.", allocated + added, group_quota)
                  }));
                }
                return models.UserScholarState.create({
                  user_id: req.params.userId,
                  scholar_id: req.body.scholar_id,
                  fill_id: null,
                  money: req.body.money,
                  state: "success"
                }, req.user);
              });
            });
        })
          .then(function() {
            return user.fetch({
              withRelated: ["applyScholars", "fills"]
            })
              .then(function (user) {
                return user.getScholarState(req.body.scholar_id)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  },

  updateScholar: function updateScholar(req, res, next) {
    if (!req.body.hasOwnProperty("money")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`money` field is required."
      }));
    }
    return models.User.getById(req.params.userId,
                               {
                                 fetchOptions: {withRelated: ["applyScholars"]}
                               })
      .then(function(user) {
        // Handle fill change
        return user.getScholarStateModel(req.params.scholarId)
          .then(function(state) {
            start = Promise.resolve(null);
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not have this scholarship."
              }));
            }
            return models.Scholar.getById(req.params.scholarId)
              .then(function(scholar) {
                if (!scholar) {
                  return Promise.reject(new errors.BadRequestError({
                    message: "Scholar with `scholar_id`==" + req.params.scholarId + " does not exist."
                  }));                  
                }
                if (scholar.get("alloc") != "money") {
                  return Promise.reject(new errors.ValidationError({
                    message: "This API is only for `money` type scholarship."
                  }));              
                }
                return scholar.allocatedMoney()
                  .then(function (allocated) {
                    // Judge if the new allocated money will exceed the group quota.
                    var new_money = _.toNumber(req.body.money);
                    var group_quota = scholar.getQuotaOfGroup(user.get("group_id"));
                    var new_allocated = allocated - state.get("money") + new_money;
                    if (new_allocated > group_quota) {
                      // Will exceed, return error.
                      return Promise.reject(new errors.ValidationError({
                        message: util.format("Allocated `%d` will exceeds quota `%d`.", new_allocated, group_quota)
                      }));
                    }
                    return state.update({
                      money: new_money
                    });
                  });
              });
          })
          .then(function() {
            return user.fetch({withRelated: ["fills", "applyScholars"]})
              .then(function(user) {
                return user.getScholarState(req.params.scholarId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  },

  uploadThanksLetter: function uploadThanksLetter(req, res, next) {
    if (!req.body.hasOwnProperty("fill") || !req.body["fill"]) {
      return Promise.reject(new errors.BadRequestError({
        message: "`fill` field is required."
      }));
    }
    return models.User.getById(req.params.userId,
                               {
                                 fetchOptions: {withRelated: ["fills", "applyScholars"]}
                               })
      .then(function(user) {
        // Handle fill change
        return user.getScholarStateModel(req.params.scholarId)
          .then(function(state) {
            start = Promise.resolve(null);
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not have this scholarship."
              }));
            }
            if (state.get("fill_id") != null) {
  	          return Promise.reject(new errors.BadRequestError({
  	            message: "The user already has submitted the thanks letter."
  	          }));               	
            }
            return models.Scholar.getById(req.params.scholarId)
              .then(function(scholar) {
              	if (!scholar) {
		              return Promise.reject(new errors.BadRequestError({
		                message: "Scholar with `scholar_id`==" + req.params.scholarId + " does not exist."
		              }));              		
              	}
              	return models.Fill.create({
  	              "form_id": scholar.get("form_id"),
  	              "user_id": req.params.userId,
  	              "content": JSON.stringify(req.body["fill"])              		
              	}, req.user)
              	  .then(function(fill) {
              	  	return state.update({
              	  		"fill_id": fill.get("id")
              	  	});
              	  });
              });
          })
          .then(function() {
            return user.fetch({withRelated: ["fills", "applyScholars"]})
              .then(function(user) {
                return user.getScholarState(req.params.scholarId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  },

  changeThanksLetter: function changeThanksLetter(req, res, next) {
    if (!req.body.hasOwnProperty("fill") || !req.body["fill"]) {
      return Promise.reject(new errors.BadRequestError({
        message: "`fill` field is required."
      }));
    }
    return models.User.getById(req.params.userId,
                               {
                                 fetchOptions: {withRelated: ["fills", "applyScholars"]}
                               })
      .then(function(user) {
        // Handle fill change
        return user.getScholarStateModel(req.params.scholarId)
          .then(function(state) {
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not have this scholarship."
              }));
            }
            hstate = state.toJSON();
  	        fill_id = hstate["fill_id"];
  	        return user.related("fills").get(fill_id).update({
  	          "content": JSON.stringify(req.body["fill"])
  	        });
          })
          .then(function() {
            return user.fetch({withRelated: ["fills", "applyScholars"]})
              .then(function(user) {
                return user.getScholarState(req.params.scholarId)
                  .then(function(hstate) {
                    res.status(201).json(expandFill(hstate, user));
                  });
              });
          });
      });
  },

  deleteScholar: function deleteScholar(req, res, next) {
    return models.User.getById(req.params.userId,
                               {
                                 fetchOptions: {withRelated: ["fills", "applyScholars"]}
                               })
      .then(function(user) {
        // Handle fill change
        return user.getScholarStateModel(req.params.scholarId)
          .then(function(state) {
            if (!state) {
              return Promise.reject(new errors.NotFoundError({
                message: "This user do not have this scholarship."
              }));
            }
            return state.destroy().then(function() {
            	res.status(204).json({}).end();
            });
          })
      });
  }
};
