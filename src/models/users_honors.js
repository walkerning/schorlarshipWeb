var _ = require("lodash")
var Promise = require("bluebird");
var bookshelfInst = require("./base");
var errors = require("../errors");

var Score = bookshelfInst.Model.extend({
  tableName: "honor_user_scores",

  scorer: function scorer() {
    return this.belongsTo("User", "scorer_id");
  }
});

var HonorUserState = bookshelfInst.Model.extend({
  tableName: "honors_users",

  scores: function scores() {
    return this.hasMany("Score", "honor_user_id");
  },
  
  fill: function fill() {
    return this.belongsTo("Fill");
  }
});

