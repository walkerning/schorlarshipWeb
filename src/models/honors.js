var bookshelfInst = require("./base");

var Honor = bookshelfInst.Model.extend({
  tableName: "honors",

  groups: function() {
    return this.beglongToMany("Group");
  },

  users: function() {
    return this.belongsToMany("User");
  },

  form: function() {
    return this.belongsTo("Form", "form_id");
  }
});

var Honors = bookshelfInst.Collection.extend({
  model: Honor
});

module.exports = {
  Honor: bookshelfInst.model("Honor", Honor),
  Honors: bookshelfInst.collection("Honors", Honors)
};
