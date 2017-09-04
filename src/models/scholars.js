var bookshelfInst = require("./base");
var _ = require("lodash")
var Promise = require("bluebird");
var util = require("util");
var errors = require("../errors");

var Scholar = bookshelfInst.Model.extend({
  tableName: "scholars",

  groups: function() {
    return this.belongsToMany("Group").withPivot(["quota"])
  },

  applyUsers: function() {
    return this.hasMany("UserScholarState");
  },

  form: function() {
    return this.belongsTo("Form", "form_id");
  },

  // Allocated count of a group
  allocatedCountOfGroup: function(gid) {
    return this.belongsToMany("User").withPivot(["state"])
      .query({
        "where": {
          "group_id": gid
        }
      })
      .fetch()
      .then(function(col) {
        return _.filter(col.toJSON(), _.matchesProperty("_pivot_state", "success")).length
      });
  },

  // Allocated count
  allocatedCount: function() {
    return this.applyUsers()
      .query({
        where: {
          "state": "success"
        }
      })
      .count();
  },

  // Allocated money of a group
  allocatedMoneyOfGroup: function(gid) {
    return this.belongsToMany("User").withPivot(["state", "money"])
      .query({
        "where": {
          "group_id": gid
        }
      })
      .fetch()
      .then(function(col) {
        return _.sum(_.map(_.filter(col.toJSON(), _.matchesProperty("_pivot_state", "success")),
                           (s) => s["_pivot_money"]));
      });
  },

  // Allocated money
  allocatedMoney: function() {
    return this.applyUsers()
      .fetch()
      .then(function(col) {
        return _.sum(_.map(_.filter(col.toJSON(), _.matchesProperty("state", "success")),
                           (s) => s["money"]));
      });
  },

  allocatedOfGroup: function(gid) {
    if (this.get("alloc") == "money") {
      return this.allocatedMoneyOfGroup(gid);
    }
    return this.allocatedCountOfGroup(gid);
  },

  allocated: function() {
    if (this.get("alloc") == "money") {
      return this.allocatedMoney()
    }
    return this.allocatedCount()
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

  omitAttributes: function omitAttributes() {
    return ["created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "groups"
    ];
  },

  getGroupQuota: function getGroupQuota() {
    var json = this.toJSON();
    group_quota = json["groups"];

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
    quota = _.find(group_quota, _.matchesProperty("group_id", gid));
    if (quota === undefined) {
      return 0;
    }
    return quota["quota"];
  },

  toClientJSON: function(options) {
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
  },

  update: function(body, user) {
    var start = Promise.resolve(null);
    // If already allocated, cannot modify the `alloc` attribute
    return bookshelfInst.transaction((trans) => {
      if (body.hasOwnProperty("alloc") && body["alloc"] != this.get("alloc")) {
        start = this.allocated().then(function(allocated) {
          if (allocated > 0) {
            return Promise.reject(new errors.ValidationError({
              message: "This scholarship has already been allocated, cannot modify its alloc type. Please delete its allocations first."
            }));
          }
        });
      }

      if (body.hasOwnProperty("group_quota") && _.isArray(body["group_quota"])) {
        gids_spec = _.reduce(body["group_quota"], function(obj, s) {
          obj[s["group_id"]] = s;
          return obj;
        }, {})
        gids = _.map(_.keys(gids_spec), (s) => {
          return parseInt(s);
        })
        now_gids = _.map(this.relations["groups"].toJSON(), function(g) {
          return g["id"];
        })
        remove_gids = _.difference(now_gids, gids);
        start = start.then(() => {
          return Promise.map(remove_gids, (remove_gid) => {
            return this.allocatedOfGroup(remove_gid)
              .then((cnt) => {
                // If Already allocated to a group, the quota of this group cannot be deleted.
                if (cnt > 0) {
                  return Promise.reject(new errors.ValidationError({
                    message: util.format("Already allocated %d to group %d. Cannot delete its group quota.", cnt, remove_gid)
                  }));
                }
              });
          })
            .then(() => {
              return this.groups().detach(remove_gids);
            })
            .then(() => {
              return Promise.map(gids, (gid) => {
                return this.allocatedOfGroup(gid)
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
              return Promise.mapSeries(gids, (gid) => {
                return this.relations["groups"].query({
                  where: {
                    group_id: gid
                  }
                })
                  .fetch()
                  .then((group) => {
                    if (group.length) {
                      return group.updatePivot(_.pick(gids_spec[gid], ["group_id", "quota"]), {
                        query: {
                          where: {
                            "group_id": gid
                          }
                        }
                      });
                    } else {
                      return this.groups().attach(_.pick(gids_spec[gid], ["group_id", "quota"]));
                    }
                  });
              });
            });
        });
      }
      self = this;
      return start.then(function() {
        return bookshelfInst.Model.prototype.update.call(self, body, user)
          .then(function(g) {
            return Scholar.getById(self.get("id"))
          })
      })
    });
  },

  delete: function() {
    var start = Promise.resolve(null)
    gids = _.map(this.relations["groups"].toJSON(), function(g) {
      return g["id"]
    })
    self = this
    var start = self.groups().detach(gids).then(function() {
      return self.destroy()
    })
    return start
  }
}, {
  fetchInlineRelations: function() {
    return ([
      "groups"
    ])
  },

  create: function(body, contextUser) {
    if (body.hasOwnProperty("alloc") && body["alloc"] == "quota") {
      if (!body.hasOwnProperty(["money"])) {
        return Promise.reject(new errors.ValidationError({
          message: "`money` field is required for quota allocation method"
        }));
      }
    }

    if (!body.hasOwnProperty("group_quota") || !_.isArray(body["group_quota"]) || body["group_quota"].length == 0) {
      return Promise.reject(new errors.ValidationError({
        message: "Non-empty `group_quota` field is required."
      }))
    }

    return bookshelfInst.Model.create.call(this, body, contextUser)
      .then(function(scholar) {
        return scholar.groups()
          .attach(_.map(body["group_quota"], function(quota) {
            return _.pick(quota, ["group_id", "quota"])
          }))
          .then(function() {
            return Scholar.forge({
              "id": scholar.get("id")
            }).fetch()
          });
      });
  }
});

var Scholars = bookshelfInst.Collection.extend({
  model: Scholar
}, {
  queriableAttributes: function() {
    return ["id",
      "name",
      "year",
      "alloc",
      "money",
      "form_id"
    ]
  }
});

module.exports = {
  Scholar: bookshelfInst.model("Scholar", Scholar),
  Scholars: bookshelfInst.collection("Scholars", Scholars)
};
