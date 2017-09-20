var _ = require("lodash")
var bookshelfInst = require("./base");

var Notice = bookshelfInst.Model.extend({
  tableName: "notices",

  update: function update(body, contextUser, updateAll) {
    var permittedUpdateAttrs = ["description", "name"];
    if (updateAll) {
      permittedUpdateAttrs = ["description", "name", "attachment_name", "attachment_hash", "suffix"];
    }
    var newBody = _.pick(body, permittedUpdateAttrs);
    if (_.isEmpty(newBody)) {
      // Avoid unneccessary update to `updated_at` field.
      return Promise.resolve(null);
    }
    return this.save(newBody, {
      context: {
        contextUser: contextUser
      }
    });
  }
}, {});

var Notices = bookshelfInst.Collection.extend({
  model: Notice
}, {
});

module.exports = {
  Notice: bookshelfInst.model("Notice", Notice),
  Notices: bookshelfInst.collection("Notices", Notices)
}
