var _ = require("lodash")
var Promise = require("bluebird");
var util = require("util");
var bookshelfInst = require("./base");
var errors = require("../errors");

var Quota = bookshelfInst.Model.extend({
  tableName: "groups_honors",

  groups: function() {
    return this.belongsTo("Group");
  },

  honors: function() {
    return this.belongsTo("Honor");
  }
});


var Honor = bookshelfInst.Model.extend({
  tableName: "honors",

  groups: function() {
    return this.belongsToMany("Group").withPivot(["quota"]);
  },

  applyUsers: function() {
    return this.hasMany("UserHonorState");
  },

  allocatedCountOfGroup: function(gid) {
    return this.applyUsersPivots()
      .query({
        where: {
          "group_id": gid,
        }
      })
      .fetch()
      .then(function(col) {
        return _.filter(col.toJSON(), _.matchesProperty("_pivot_state", "success")).length;
      });
  },

  applyUsersPivots: function() {
    return this.belongsToMany("User").withPivot(["state"]);
  },

  form: function() {
    return this.belongsTo("Form", "form_id");
  },


  omitAttributes: function omitAttributes() {
    return ["created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "groups"
    ];
  },

  renamePivotAttributes: function renamePivotAttributes() {
    return {
      _pivot_quota: "quota",
      type: "type",
      name: "group",
      id: "group_id"
    };
  },

  pickPivotAttributes: function pickPivotAttributes() {
    return ["group",
      "quota",
      "type",
      "group_id"
    ];
  },

  update: function update(body, contextUser) {
    return bookshelfInst.transaction((trans) => {
      var start = Promise.resolve(null);
      // `group_quota` field must be an array.
      if (body.hasOwnProperty("group_quota") && _.isArray(body["group_quota"])) {
        var gids_spec = _.reduce(body["group_quota"], function(obj, s) {
          obj[s["group_id"]] = s;
          return obj;
        }, {});
        var gids = _.map(_.keys(gids_spec), (s) => {
          return parseInt(s);
        });
        var now_gids = _.map(this.relations["groups"].toJSON(), (s) => {
          return s["id"]
        });
        // The gids that should be removed
        var gids_remove = _.difference(now_gids, gids);
        // console.log("gids_remove: ", gids_remove, now_gids, gids);
        start = Promise.map(gids_remove, (remove_gid) => {
          // If Already allocated to a group, the quota of this group cannot be deleted.
          return this.allocatedCountOfGroup(remove_gid)
            .then((cnt) => {
              if (cnt > 0) {
                return Promise.reject(new errors.ValidationError({
                  message: util.format("Already allocated %d to group %d. Cannot delete its group quota.", cnt, remove_gid)
                }));
              }
            });
        })
          .then(() => {
            return this.groups().detach(gids_remove);
          })
          .then(() => {
            return Promise.map(gids, (gid) => {
              return this.allocatedCountOfGroup(gid)
                .then((cnt) => {
                  if (cnt > gids_spec[gid]["quota"]) {
                    return Promise.reject(new errors.ValidationError({
                      message: util.format("Already allocated %d to group %d. Cannot set its group quota to %d.", cnt, gid, gids_spec[gid]["quota"])
                    }));
                  }
                });
            });
          })
          .then(() => {
            return this.fetch().then(() => {
              return Promise.mapSeries(gids, (gid) => {
                return self.relations["groups"].query({
                  where: {
                    group_id: gid
                  }
                })
                  .fetch()
                  .then((c) => {
                    if (c.length) {
                      // Already exists. call `updatePivot`
                      return c.updatePivot(_.pick(gids_spec[gid], ["quota"]), {
                        query: {
                          where: {
                            "group_id": gid
                          }
                        }
                      });
                    } else {
                      // Not exists. call `attach`
                      return this.groups().attach(_.pick(gids_spec[gid], ["quota", "group_id"]));
                    }
                  });
              });
            });
          });
      }
      // Update attributes other than the `group_quota`.
      var self = this;
      return start.then(function() {
        return bookshelfInst.Model.prototype.update.call(self, body, contextUser);
      });
    });
  },

  getGroupQuota: function getGroupQuota() {
    var json = this.toJSON();
    var group_quota = json["groups"];

    var renamePivotAttributes = this.renamePivotAttributes();
    var pickPivotAttributes = this.pickPivotAttributes();
    group_quota = _.map(group_quota, function(model) {
      _.forEach(renamePivotAttributes, function(value, key) {
        model[value] = model[key];
      });
      model = _.pick(model, pickPivotAttributes);
      return model;
    });
    return group_quota;
  },

  getQuotaOfGroup: function getGroupQuota(gid) {
    var group_quota = this.getGroupQuota();
    var quota = _.find(group_quota, _.matchesProperty("group_id", gid));
    if (quota === undefined) {
      return 0;
    }
    return quota["quota"];
  },

  toClientJSON: function toClientJSON(options) {
    var quota = 0;

    var json = this.toJSON();
    json["group_quota"] = json["groups"];

    var renamePivotAttributes = this.renamePivotAttributes();
    var pickPivotAttributes = this.pickPivotAttributes();
    json["group_quota"] = _.map(json["group_quota"], function(model) {
      _.forEach(renamePivotAttributes, function(value, key) {
        model[value] = model[key];
      });
      model = _.pick(model, pickPivotAttributes);
      quota += model["quota"];
      return model;
    });
    json["quota"] = quota;
    return _.omit(json, this.omitAttributes());
  }
}, {
  fetchInlineRelations: function fetchInlineRelations() {
    return [
      "groups"
    ];
  },

  // FIXME: unify the `create` and `update` interface
  //        `create` promise the refreshed model instance
  //        `update` promise nothing
  create: function create(body, contextUser) {
    if (!body.hasOwnProperty("group_quota") || !_.isArray(body["group_quota"]) || body["group_quota"].length == 0) {
      return Promise.reject(new errors.ValidationError({
        message: "Non-empty `group_quota` field is required."
      }));
    }
    return bookshelfInst.Model.create.call(this, body, contextUser)
      .then(function(m) {
        return m.groups()
          .attach(_.map(body["group_quota"], function(g) {
            return _.pick(g, ["group_id", "quota"]);
          }))
          .then(function() {
            return Honor.forge({
              "id": m.get("id")
            }).fetch();
          });
      });
  }
});

var Honors = bookshelfInst.Collection.extend({
  model: Honor
}, {
  queriableAttributes: function queriableAttributes() {
    return ["id",
      "name",
      "year",
      "start_time",
      "end_time",
      "form_id"
    ];
  },

  // getByQuery: function(query, related)
  // {
  //   return this.forge()
  //     .query({
  //       where: _.pick(query, this.queriableAttributes())
  //     })
  //     .fetch({withRelated: related});
  // }

});

module.exports = {
  Honor: bookshelfInst.model("Honor", Honor),
  Honors: bookshelfInst.collection("Honors", Honors),
  Quota: bookshelfInst.model("Quota", Quota),
  Quotas: bookshelfInst.collection("Quotas", Honors)
};
