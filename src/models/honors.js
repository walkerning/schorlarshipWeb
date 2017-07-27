var _ = require("lodash")
var Promise = require("bluebird");
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

  form: function() {
    return this.belongsTo("Form", "form_id");
  },


  omitAttributes: function omitAttributes(){
    return ["created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "groups"
    ];
  },

  renamePivotAttributes: function renamePivotAttributes(){
    return {
      _pivot_quota: "quota",
      type: "type",
      name: "group",
      id: "group_id"
    };
  },

  pickPivotAttributes: function pickPivotAttributes(){
    return ["group",
            "quota",
            "type",
            "group_id"
           ];
  },

  update: function update(body, contextUser) {
    var start = Promise.resolve(null);
    if (body.hasOwnProperty("group_quota") && _.isArray(body["group_quota"])) {
      gids_spec = _.reduce(body["group_quota"], function (obj, s) {
        obj[s["group_id"]] = s;
        return obj;
      }, {});
      gids = _.keys(gids_spec)
      now_gids = _.map(this.relations["groups"].toJSON(), (s) => {return s["id"]})
      // The gids that should be removed
      gids_remove = _.difference(now_gids, gids);
      self = this;
      start = self.groups().detach(gids_remove).then(function () {
        return self.fetch().then(function() {
          return Promise.mapSeries(gids, function(gid) {
            return self.relations["groups"].query({where: {group_id: gid}})
              .fetch()
              .then(function(c) {
                if (c.length) {
                  // Already exists. call `updatePivot`
                  return c.updatePivot(_.pick(gids_spec[gid], ["quota", "group_id"]));
                } else {
                  // Not exists. call `attach`
                  return self.groups().attach(_.pick(gids_spec[gid], ["quota", "group_id"]));
                }
              });
          });
        });
      })
    }
    // Update attributes other than the `group_quota`.
    self = this;
    return start.then(function () {
      return bookshelfInst.Model.prototype.update.call(self, body, contextUser);
    });
  },

  getGroupQuota: function getGroupQuota() {
    var json = this.toJSON();
    group_quota = json["groups"];

    var renamePivotAttributes = this.renamePivotAttributes();
    var pickPivotAttributes = this.pickPivotAttributes();
    group_quota = _.map(group_quota, function(model){
      _.forEach(renamePivotAttributes, function(value, key){
        model[value] = model[key];
      });
      model = _.pick(model, pickPivotAttributes);
      return model;
    });
    return group_quota;
  },

  toClientJSON: function toClientJSON(options) {
    var quota = 0;

    var json = this.toJSON();
    json["group_quota"] = json["groups"];

    var renamePivotAttributes = this.renamePivotAttributes();
    var pickPivotAttributes = this.pickPivotAttributes();
    json["group_quota"] = _.map(json["group_quota"], function(model){
      _.forEach(renamePivotAttributes, function(value, key){
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
      .then(function (m) {
        return m.groups()
          .attach(_.map(body["group_quota"],
                        function (g) {
                          return _.pick(g, ["group_id", "quota"]);
                        }))
          .then(function () {
            return Honor.forge({"id": m.get("id")}).fetch();
          });
      });
  }
});

var Honors = bookshelfInst.Collection.extend({
  model: Honor
}, {
  queriableAttributes: function queriableAttributes(){
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
