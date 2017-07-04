var bookshelfInst = require("./base");
var _ = require("lodash")
var Promise = require("bluebird");
var errors = require("../errors");

var Scholar = bookshelfInst.Model.extend({
  tableName: "scholars",

  users: function() {
    return this.belongsToMany("User");
  },

  form: function() {
    return this.belongsTo("Form", "form_id");
  },

  groups: function () {
    return this.belongsToMany("Group").withPivot(["quota"])
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

  omitAttributes: function omitAttributes(){
    return ["created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "groups"
    ];
  },

  toClientJSON: function (options) {
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
  },

  update: function (body, user) {
    var start = Promise.resolve(null)
    if (body.hasOwnProperty("group_quota") && _.isArray(body["group_quota"])) {
      gids_spec = _.reduce(body["group_quota"], function (obj, s) {
        obj[s["group_id"]] = s
        return obj
      }, {})
      gids = _.map(_.keys(gids_spec),(s) => {return parseInt(s)})
      now_gids = _.map(this.relations["groups"].toJSON(), function (g) {
        return g["id"]
      })
      remove_gids = _.difference(now_gids, gids)
      self = this
      start = self.groups().detach(remove_gids).then(function () {
        return Promise.mapSeries(gids, function (gid) {
          return self.relations["groups"].query({where: {group_id: gid}})
            .fetch()
            .then(function (group) {
              if (group.length) {
                return group.updatePivot(_.pick(gids_spec[gid], ["group_id", "quota"]),{query:{where:{"group_id":gid}}})
              } else {
                return self.groups().attach(_.pick(gids_spec[gid], ["group_id", "quota"]))
              }
            })
        })
      })
    }
    self = this
    return start.then(function () {
      return bookshelfInst.Model.prototype.update.call(self,body,user)
        .then(function (g) {
          return Scholar.getById(self.get("id"))
        })
    })
  },

  delete: function () {
    var start = Promise.resolve(null)
    gids = _.map(this.relations["groups"].toJSON(),function (g) {
      return g["id"]
    })
    self = this
    var start = self.groups().detach(gids).then(function () {
      return self.destroy()
    })
    return start
  }
}, {
  fetchInlineRelations: function () {
    return([
      "groups"
    ])
  },
  
  create:function (body, user) {
    if (body.hasOwnProperty("alloc") && body["alloc"] == "quota")
    {
      if (!body.hasOwnProperty(["money"]))
      {
        return Promise.reject(new errors.ValidationError({
          message:"`money` field is required for quota allocation method"
        }))
      }
    }

    if (!body.hasOwnProperty("group_quota") || !_.isArray(body["group_quota"]) || body["group_quota"].length==0)
    {
      return Promise.reject(new errors.ValidationError({
        message:"Non-empty `group_quota` field is required."
      }))
    }

    return bookshelfInst.Model.create.call(this, body, user)
      .then(function (scholar){
        return scholar.groups()
          .attach(_.map(body["group_quota"],function (quota) {
            return _.pick(quota,["group_id","quota"])
          }))
          .then(function () {
            return Scholar.forge({"id":scholar.get("id")}).fetch()
          })
      })
  }
});

var Scholars = bookshelfInst.Collection.extend({
  model: Scholar
}, {
  queriableAttributes:function () {
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
