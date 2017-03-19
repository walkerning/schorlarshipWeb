var bookshelfInst = require("./base");

var Form = bookshelfInst.Model.extend({
  tableName: "forms",

  scholars: function() {
    return this.hasMany("Scholar", "form_id");
  },

  honors: function() {
    return this.hasMany("Honor", "form_id");
  }
});

var Forms = bookshelfInst.Collection.extend({
  model: Form
});

module.exports = {
  Form: bookshelfInst.model("Form", Form),
  Forms: bookshelfInst.collection("Forms", Forms)
};
