var _ = require("lodash")
var Promise = require("bluebird");
var bookshelfInst = require("./base");
var errors = require("../errors");

var UserScholarState = bookshelfInst.Model.extend({
  tableName: "scholars_users",

  fill: function fill() {
    return this.belongsTo("Fill");
  },

  user: function() {
    return this.belongsTo("User", "user_id");
  },

  scholar: function() {
    return this.belongsTo("Scholar", "scholar_id");
  }
}, {
  getUserScholarState: function getState(user_id, scholar_id) {
    return this.forge()
      .where({
        user_id: user_id,
        scholar_id: scholar_id
      })
      .fetch({
        withRelated: ["fill"]
      });
  }
});

var UserScholarStates = bookshelfInst.Collection.extend({
  model: UserScholarState
}, {
  queriableAttributes: function queriableAttributes() {
    return ["id",
      "state",
      "scholar_id"
    ];
  },
  getUserScholarStates: function getStates(user_ids, scholar_ids) {
    return this.forge()
      .query(function(qb) {
        qb.where("user_id", "in", user_ids).andWhere("scholar_id", "in", scholar_ids)
      })
      .fetch({
        withRelated: ["fill"]
      });
  }
});

module.exports = {
  UserScholarState: bookshelfInst.model("UserScholarState", UserScholarState),
  UserScholarStates: bookshelfInst.collection("UserScholarStates", UserScholarStates),
};
