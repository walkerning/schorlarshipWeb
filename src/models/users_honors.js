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

var Scores = bookshelfInst.Collection.extend({
  model: Score
});

var UserHonorState = bookshelfInst.Model.extend({
  tableName: "honors_users",

  scores: function scores() {
    return this.hasMany("Score", "honor_user_id");
  },
  
  fill: function fill() {
    return this.belongsTo("Fill");
  },

  user: function() {
    return this.belongsTo("User", "user_id");
  },

  honor: function() {
    return this.belongsTo("Honor", "honor_id");
  }
});

var UserHonorStates = bookshelfInst.Collection.extend({
  model: UserHonorState
});

module.exports = {
  UserHonorState: bookshelfInst.model("UserHonorState", UserHonorState),
  UserHonorStates: bookshelfInst.collection("UserHonorStates", UserHonorStates),

  Score: bookshelfInst.model("Score", Score),
  Scores: bookshelfInst.collection("Score", Scores),
};
