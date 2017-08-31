var _ = require("lodash")
var Promise = require("bluebird");
var util = require("util");
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
  },

  addScore: function addScore(context_user, score) {
    scorer_id = context_user.get("id");
    // Check whether this scorer already submit a score
    if (_.includes(_.map(this.related("scores").toJSON(), (s) => {
        return s["scorer_id"];
      }), scorer_id)) {
      return Promise.reject(new errors.ValidationError({
        message: util.format("This scorer with id(%d) has already submitted a score, to modify the score, use the PUT API instead.",
          scorer_id)
      }));
    }
    return Score.create({
      scorer_id: scorer_id,
      score: score,
      honor_user_id: this.get("id")
    }, context_user);
  },

  updateScore: function updateScore(context_user, score) {
    scorer_id = context_user.get("id");
    return Score.forge({
      scorer_id: scorer_id,
      honor_user_id: this.get("id")
    }).fetch()
      .then(function(sc) {
        // Check whether this scorer already submit a score
        if (!sc) {
          return Promise.reject(new errors.ValidationError({
            message: util.format("This scorer with id(%d) has not submitted a score, to submit a new score, use the POST API instead.",
              scorer_id)
          }));
        }
        return sc.update({
          score: score
        });
      });
  },

  deleteScore: function deleteScore(context_user) {
    scorer_id = context_user.get("id");
    return Score.forge({
      scorer_id: scorer_id,
      honor_user_id: this.get("id")
    }).fetch()
      .then(function(sc) {
        // Check whether this scorer already submit a score
        if (!sc) {
          return Promise.reject(new errors.ValidationError({
            message: util.format("This scorer with id(%d) has not submitted a score.",
              scorer_id)
          }));
        }
        return sc.destroy();
      });
  }
}, {
  getUserHonorState: function getState(user_id, honor_id) {
    return this.forge()
      .where({
        user_id: user_id,
        honor_id: honor_id
      })
      .fetch({
        withRelated: ["fill"]
      });
  },

  fetchInlineRelations: function fetchInlineRelations() {
    return ["scores"];
  }
});

var UserHonorStates = bookshelfInst.Collection.extend({
  model: UserHonorState
}, {
  queriableAttributes: function queriableAttributes() {
    return ["id",
      "state",
      "honor_id"
    ];
  }
});

module.exports = {
  UserHonorState: bookshelfInst.model("UserHonorState", UserHonorState),
  UserHonorStates: bookshelfInst.collection("UserHonorStates", UserHonorStates),

  Score: bookshelfInst.model("Score", Score),
  Scores: bookshelfInst.collection("Score", Scores),
};
