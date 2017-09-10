var _ = require("lodash")
var Promise = require("bluebird");
var util = require("util");
var bookshelfInst = require("./base");
var errors = require("../errors");


var UserReasonState = bookshelfInst.Model.extend({
  tableName: "reasons_users",

  fill: function fill() {
    return this.belongsTo("Fill");
  },

  user: function() {
    return this.belongsTo("User", "user_id");
  },

  reason: function() {
    return this.belongsTo("Reason", "year");
  }
}, {
  getUserReasonState: function getState(user_id, year) {
    return this.forge()
      .where({
        user_id: user_id,
        year: year
      })
      .fetch({
        withRelated: ["fill"]
      });
  }
});

var UserReasonStates = bookshelfInst.Collection.extend({
  model: UserReasonState
}, {
  queriableAttributes: function queriableAttributes() {
    return ["year",
      "user_id"]
  }
});

module.exports = {
  UserReasonState: bookshelfInst.model("UserReasonState", UserReasonState),
  UserReasonStates: bookshelfInst.collection("UserReasonStates", UserReasonStates)
};
