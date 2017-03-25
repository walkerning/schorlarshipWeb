var _ = require("lodash");
var bookshelfInst = require("./base");
var errors = require("../errors");
var Promise = require("bluebird");
var bcrypt = require("bcryptjs");
var validationCfg = require("../config").validation;
var bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
var bcryptHash = Promise.promisify(bcrypt.hash);
var bcryptCompare = Promise.promisify(bcrypt.compare);

// Validate the plain password.
function validatePassword(password) {
  // FIXME: Lack detailed information
  return validationCfg.passwordValidator.validate(password);
}
;

function generatePasswordHash(password) {
  return bcryptGenSalt().then(function(salt) {
    return bcryptHash(password, salt);
  });
}

var Group = bookshelfInst.Model.extend({
  tableName: "groups",

  users: function() {
    return this.hasMany("User");
  },

  honors: function() {
    return this.belongsToMany("Honor");
  }
});

var User = bookshelfInst.Model.extend({
  tableName: "users",

  group: function() {
    return this.belongsTo("Group", "group_id");
  },

  honors: function() {
    return this.belongToMany("Honor");
  },

  scholars: function() {
    return this.belongsToMany("Scholar");
  },

  permissions: function() {
    return this.belongsToMany("Permission");
  },

  onSaving: function(newPage, attrs, options) {
    var self = this;
    bookshelfInst.Model.prototype.onSaving.apply(this, arguments);

    if (self.isNew()) {
      this.set("active", true);
    }

    if (self.isNew() || self.hasChanged("password")) {
      this.set("password", String(this.get("password")));
      if (!validatePassword(this.get("password"))) {
        return Promise.reject(new errors.ValidationError({
          message: "Illegal `password`."
        }));
      }
      return generatePasswordHash(self.get("password"))
        .then(function(hash) {
          self.set("password", hash);
        });
    }
    return;
  },

  // A password checker that return a promise.
  isPasswordCorrect: function isPasswordCorrect(plainPass, hashedPass) {
    if (!plainPass || !hashedPass) {
      return Promise.reject(new errors.ValidationError({
        message: "Password required for operation."
      }));
    }

    return bcryptCompare(plainPass, hashedPass)
      .then(function(matched) {
        if (matched) {
          return;
        }
        return Promise.reject(new errors.ValidationError({
          message: "Password incorrect."
        }));
      });
  },

  getPermissions: function getPermissions() {
    return this.related("permissions").toJSON();
  },

  // FIXME: 这个方法放到每个模型里. 根据contextUser permission判断每个model的哪些字段可以被更新!    
  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    var perms = contextUser.getPermissions().map(function(v) {
      return v["name"]
    });
    if (_.includes(perms, "user")) {
      // with user management permission
      return _.difference(this.permittedAttributes(), this.autoAttributes());
    } else if (contextUser.get("id") == this.get("id")) {
      // contextUser == this
      return ["email", "password"];
    }
  },

}, {
  secretAttributes: function secretAttributes() {
    return ["password"];
  },

  queriableAttributes: function queriableAttributes() {
    return ["id",
      "group_id",
      "type",
      "name",
      "student_id",
      "email",
      "class",
      "gpa",
      "class_rank",
      "year_rank"
    ];
  },

  fetchInlineRelations: function fetchInlineRelations() {
    return [
      "group",
      "permissions"
    ];
  }

});

var Users = bookshelfInst.Collection.extend({
  model: User
});

var Groups = bookshelfInst.Collection.extend({
  model: Group
});

module.exports = {
  User: bookshelfInst.model("User", User),
  Users: bookshelfInst.collection("Users", Users),

  Group: bookshelfInst.model("Group", Group),
  Groups: bookshelfInst.collection("Groups", Groups)
};
