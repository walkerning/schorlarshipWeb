var bookshelfInst = require("./base");

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
  }
}, {
  fetchInlineRelations: function () {
    return([
      "groups"
    ])
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
