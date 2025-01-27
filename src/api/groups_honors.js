var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")
var errors = require("../errors")

module.exports = {
  /*
  list: function list(req, res, next) {
    if (!req.query.hasOwnProperty("honor_ids")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`honor_ids` field is required."
      }));
    }
    return models.Group
      .getById(req.params.groupId, {
        fetchOptions: {
          withRelated: ["users"]
        }
      })
      .then(function(group) {
        var users = group.getUsers();
        var honor_ids = _.map(_.split(req.query["honor_ids"], ","), _.toNumber);
        var tasks = [];
        for (var i in users) {
          for (var j in honor_ids) {
            tasks.push(models.UserHonorState.getUserHonorState(users[i]["id"], honor_ids[j]));
          }
        }
        return Promise.all(tasks).then(results => {
          results = _.map(results, (h) => {
            if (h != null) {
              h = h.toJSON();
              h["fill"] = h["fill"]["content"];
            }
            return h;
          });
          var rates = {};
          for (var i in users) {
            i = _.toNumber(i);
            var t = results.slice(i * honor_ids.length, (i + 1) * honor_ids.length);
            if (!_.every(t, _.isNull)) {
              rates[users[i]["id"]] = t;
            }
          }
          res.status(200).json(rates);
        })
      });
  }
  */
  list: function list(req, res, next) {
    if (!req.query.hasOwnProperty("honor_ids")) {
      return Promise.reject(new errors.BadRequestError({
        message: "`honor_ids` field is required."
      }));
    }
    return models.Group
      .getById(req.params.groupId, {
        fetchOptions: {
          withRelated: ["users"]
        }
      })
      .then(function(group) {
        var users = group.getUsers();
        var user_ids = _.map(users, (user) => { return user["id"] });
        var honor_ids = _.map(_.split(req.query["honor_ids"], ","), _.toNumber);
        return models.UserHonorStates.getUserHonorStates(user_ids, honor_ids).then(results => {
          results = results.toClientJSON();
          results = _.map(results, (h) => {h["fill"] = h["fill"]["content"]; return h});
          var rates = {};
          for (var i in results) {
            if (rates[results[i]["user_id"]] == undefined) {
              rates[results[i]["user_id"]] = [];
            }
            rates[results[i]["user_id"]][_.indexOf(honor_ids, results[i]["honor_id"])] = results[i];
          }
          for (var i in rates) {
            for (var j in honor_ids) {
              if (rates[i][j] == undefined) {
                rates[i][j] = null;
              }
            }
          }
          res.status(200).json(rates);
        });
      });
  }  
}
