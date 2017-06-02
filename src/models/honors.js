var bookshelfInst = require("./base");
var _ = require("lodash")
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

  users: function() {
    return this.belongsToMany("User");
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
      _pivot_quota:"quota",
      description:"type",
      name:"group"
    };
  },

  pickPivotAttributes: function pickPivotAttributes(){
    return ["group",
      "quota",
      "type"
    ];
  },

  toClientJSON: function toClientJSON(options){
    var quota=0;

    var json=this.toJSON();
    json["group_quota"]=json["groups"];

    var renamePivotAttributes=this.renamePivotAttributes();
    var pickPivotAttributes=this.pickPivotAttributes();
    json["group_quota"]=_.map(json["group_quota"],function(model){
      _.forEach(renamePivotAttributes,function(value,key){
        model[value]=model[key];
      });
      model=_.pick(model,pickPivotAttributes);
      quota+=model["quota"];
      return model;
    });
    json["quota"]=quota;
    return _.omit(json,this.omitAttributes());
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
  getByQuery: function(query,related)
  {
    return this.forge()
      .query({
        where: _.pick(query, this.queriableAttributes())
      })
      .fetch({withRelated:related});
  }

});

module.exports = {
  Honor: bookshelfInst.model("Honor", Honor),
  Honors: bookshelfInst.collection("Honors", Honors),
  Quota: bookshelfInst.model("Quota", Quota),
  Quotas: bookshelfInst.collection("Quotas", Honors)
};
