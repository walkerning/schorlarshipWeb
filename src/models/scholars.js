var bookshelfInst = require("./base");

var Scholar = bookshelfInst.Model.extend({
  tableName: "scholars",

  users: function() {
    return this.belongsToMany("User");
  },

  form: function() {
    return this.belongsTo("Form", "form_id");
  }
});

var Scholars = bookshelfInst.Collection.extend({
  model: Scholar
});

module.exports = {
  Scholar: bookshelfInst.model("Scholar", Scholar),
  Scholars: bookshelfInst.collection("Scholars", Scholars)
};
