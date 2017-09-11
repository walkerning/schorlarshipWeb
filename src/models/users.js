var _ = require("lodash");
var bookshelfInst = require("./base");
var Promise = require("bluebird");
var bcrypt = require("bcryptjs");
var sendemail = require("../config").sendemail;
var models = require(".");
var errors = require("../errors");
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
  },

  // Get users in this group
  getUsers: function() {
    return this.related("users").toClientJSON();
  }

});

var User = bookshelfInst.Model.extend({
  tableName: "users",

  group: function() {
    return this.belongsTo("Group", "group_id");
  },

  applyReasons: function() {
    return this.hasMany("UserReasonState", "user_id")
  },

  applyHonors: function() {
    return this.hasMany("UserHonorState", "user_id");
  },
  
  applyScholars: function() {
    return this.hasMany("UserScholarState", "user_id");
  },

  permissions: function() {
    return this.belongsToMany("Permission");
  },

  fills: function() {
    return this.hasMany("Fill");
  },


  // Attributes for filtering and validation
  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    var perms = contextUser.getPermissionNames();
    if (_.includes(perms, "user")) {
      // with user management permission
      return _.difference(this.permittedAttributes(), this.autoAttributes());
    } else if (contextUser.get("id") == this.get("id")) {
      // contextUser == this
      return ["email", "password", "phone"];
    }
  },

  // Database interaction event handlers.
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

  getPermissionNames: function getPermissionNames() {
    return this.related("permissions").toAttrList("name");
  },

  // send email utils
  sendEmail: function sendEmail(subject, content) {
    return sendemail.sendEmail(this.get("email"), subject, content)
  },
  
  // get applied honors
  getHonorStates: function getHonorStates() {
    return this.related("applyHonors").toJSON();
  },

  getReasonStates: function getHonorStates() {
    return this.related("applyReasons").toJSON();
  },

  // get applied scholars
  getScholarStates: function getScholarStates() {
    return this.related("applyScholars").toJSON();
  },

  getHonorStatesCol: function getHonorStatesCol(queries) {
    return this.related("applyHonors")
      .query({
        where: _.pick(queries, models.UserHonorStates.queriableAttributes())
      })
      .fetch()
      .then(function(c) {
        return c.toJSON();
      });
  },

  getReasonStatesCol: function getReasonStatesCol(queries) {
    return this.related("applyReasons")
      .query({
        where: _.pick(queries, models.UserReasonStates.queriableAttributes())
      })
      .fetch()
      .then(function(c) {
        return c.toJSON();
      });
  },

  getScholarStatesCol: function getScholarStatesCol(queries) {
    return this.related("applyScholars")
      .query({
        where: _.pick(queries, models.UserScholarStates.queriableAttributes())
      })
      .fetch()
      .then(function(c) {
        return c.toJSON();
      });
  },

  getHonorState: function getHonorState(honor_id) {
    return this.getHonorStateModel(honor_id)
      .then(function (state) {
        if (state !== null) {
          return state.toJSON();
        }
        return null;
      });
  },

  getReasonState: function getReasonState(year) {
    return this.getReasonStateModel(year)
      .then(function (state) {
        if (state !== null) {
          return state.toJSON();
        }
        return null;
      });
  },

  getScholarState: function getScholarState(scholar_id) {
    return this.getScholarStateModel(scholar_id)
      .then(function (state) {
        if (state !== null) {
          return state.toJSON();
        }
        return null;
      });
  },

  getHonorStateModel: function getHonorStateModel(honor_id) {
    return models.UserHonorState
      .forge()
      .where({user_id: this.get("id"), honor_id: honor_id})
      .fetch();
  },

  getReasonStateModel: function getHonorStateModel(year) {
    return models.UserReasonState
      .forge()
      .where({user_id: this.get("id"), year: year})
      .fetch();
  },

  getScholarStateModel: function getScholarStateModel(scholar_id) {
    return models.UserScholarState
      .forge()
      .where({user_id: this.get("id"), scholar_id: scholar_id})
      .fetch();
  },

  removeScholarsOfYear: function removeScholarsOfYear(year) {
    var scholars_col = this.belongsToMany("Scholar");
    return this.belongsToMany("Scholar")
      .query({where: {year: year}})
      .fetch()
      .then(function (schos) {
        return scholars_col.detach(_.map(schos.toJSON(), (scho) => { return scho["id"]; }));
      });
  },

  toClientJSON: function toClientJSON(options) {
    options = _.mergeWith({
      omitPivot: true,
      flattenRelation: this.constructor.fetchInlineRelations(),
    }, options, function(dstValue, srcValue) {
      if (_.isArray(dstValue)) {
        return _.union(dstValue, srcValue);
      }
    });

    var json = _.omitBy(_.omit(this.toJSON(options), this.constructor.secretAttributes()), _.isNull);
    if (options.flattenRelation.length) {
      // _.forEach(_.keys(this.relations), function(key) {
      _.forEach(options.flattenRelation, function(key) {
        if (json[key]) {
          if (_.isArray(json[key])) {
            json[key] = _.map(json[key], (v) => v.name || v.id);
          } else {
            if (key === "group") {
              json["type"] = json[key].type;
            }
            json[key] = json[key].name || json[key].id;
          }
        }
      });
    }
    return json;
  }
}, {
  secretAttributes: function secretAttributes() {
    return ["password"];
  },

  fetchInlineRelations: function fetchInlineRelations() {
    return [
      "group",
      "permissions"
    ];
  },

  create: function create(body, contextUser) {
    var fields =  bookshelfInst.Model.prototype.permittedUpdateAttributes.call(User.forge(),
                                                                               contextUser);
    if (contextUser) {
      fields = contextUser.permittedUpdateAttributes(contextUser);
    }
    return bookshelfInst.Model.create.call(this, _.pick(body, fields),
      contextUser);
  }

});

var Users = bookshelfInst.Collection.extend({
  model: User

}, {
  queriableAttributes: function queriableAttributes() {
    return ["id",
      "group_id",
      "name",
      "student_id",
      "email",
      "class",
      "gpa",
      "class_rank",
      "year_rank"
    ];
  }
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
