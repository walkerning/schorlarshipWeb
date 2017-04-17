var bookshelfInst = require("./base");

var Form = bookshelfInst.Model.extend({
  tableName: "forms",

  scholars: function() {
    return this.hasMany("Scholar", "form_id");
  },

  honors: function() {
    return this.hasMany("Honor", "form_id");
  },

  toClientJSON: function toClientJSON(options) {
    var json = bookshelfInst.Model.prototype.toClientJSON.call(this, options);
    json.fields = JSON.parse(json.fields);
    return json;
  }
});

var Forms = bookshelfInst.Collection.extend({
  model: Form
}, {
  queriableAttributes: function queriableAttributes() {
    return ["id", "name", "type"];
  }
});

var Fill = bookshelfInst.Model.extend({
  tableName: "fills",

  form: function() {
    return this.belongsTo("Form", "form_id");
  },

  user: function() {
    return this.belongsTo("User", "user_id");
  }

});

var Fills = bookshelfInst.Collection.extend({
  model: Fill
});

module.exports = {
  Form: bookshelfInst.model("Form", Form),
  Forms: bookshelfInst.collection("Forms", Forms),

  Fill: bookshelfInst.model("Fill", Fill),
  Fills: bookshelfInst.collection("Fills", Fills)
};
