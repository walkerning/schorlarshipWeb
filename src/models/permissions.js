var bookshelfInst = require("./base");

var Permission = bookshelfInst.Model.extend({
  tableName: "permissions",

  users: function() {
    return this.belongsToMany("User");
  }
});

var Permissions = bookshelfInst.Collection.extend({
  model: Permission
});

module.exports = {
  Permission: bookshelfInst.model("Permission", Permission),
  Permissions: bookshelfInst.collection("Permissions", Permissions)
};
