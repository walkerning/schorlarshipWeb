var _ = require("lodash")
var bookshelfInst = require("./base");

var Reason = bookshelfInst.Model.extend({
  tableName: "reasons",
  idAttribute: "year",

  applyUsers: function() {
    return this.hasMany("UserReasonState", "year");
  },

  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    return ["form_id", "name"];
  }
}, {
  getById: function getById(id, options) {
    return bookshelfInst.Model.getById.call(this, id, options, "year");
  }
});

var Reasons = bookshelfInst.Collection.extend({
  model: Reason
}, {
  queriableAttributes: function queriableAttributes() {
    return ["year", "name"];
  }
});

module.exports = {
  Reason: bookshelfInst.model("Reason", Reason),
  Reasons: bookshelfInst.collection("Reasons", Reasons)
}
