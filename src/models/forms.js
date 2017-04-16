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

module.exports = {
  Form: bookshelfInst.model("Form", Form),
  Forms: bookshelfInst.collection("Forms", Forms)
};
