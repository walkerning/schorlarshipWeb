var Promise = require("bluebird");
var _ = require("lodash");
var bookshelf = require("bookshelf");
var db = require("../data").db;
var schema = require("../data").schema;
var validation = require("../data").validation;
var errors = require("../errors");

var bookshelfInst;

bookshelfInst = bookshelf(db);
bookshelfInst.plugin("registry");

bookshelfInst.Model = bookshelfInst.Model.extend({
  // `hasTimestamps` will make bookshelf handle created_at and updated_at properties automatically.
  hasTimestamps: true,

  permittedAttributes: function permittedAttribute() {
    return _.keys(schema[this.tableName]);
  },

  _isUnique: function(spec) {
    return spec.hasOwnProperty("unique") && spec.unique == true;
  },

  assertUnique: function() {
    var self = this;
    return Promise.map(_.keys(_.pickBy(schema[this.tableName], this._isUnique)), function validateColumn(key) {
      if (self.hasChanged(key)) {
        return self.constructor
          .query("where", key, "=", self.get(key))
          .fetch()
          .then(function(existing) {
            if (existing) {
              return Promise.reject(new errors.ValidationError({
                message: "Illegal `" + key + "`: Duplicated. " + self.get(key) + "` already exists."
              }));
            }
            return Promise.resolve();
          });
      } else {
        return Promise.resolve();
      }
    });
  },

  // `initialize` - constructor for model creation
  initialize: function initialize() {
    this.on("creating", this.onCreating);

    this.on("saving", function onSaving() {
      var self = this;
      var args = arguments;

      return Promise.resolve(self.onSaving.apply(self, args))
        .then(function validated() {
          return Promise.resolve(self.onValidate.apply(self, args));
        })
        .then(function uniqued() {
          return self.assertUnique();
        });
    });

  },

  onValidate: function onValidate() {
    return validation.validateSchema(this.tableName, this.toJSON(), this.autoAttributes());
  },

  contextUser: function contextUser(options) {
    if (options.context && options.context.contextUser) {
      return options.context.contextUser.get("id");
    } else {
      return 0;
    }
  },

  onCreating: function onCreating(newObj, attr, options) {
    if (schema[this.tableName].hasOwnProperty('created_by') && !this.get('created_by')) {
      this.set('created_by', this.contextUser(options));
    }
  },

  onSaving: function onSaving(newObj, attr, options) {
    // Remove any properties which don't belong on the model
    this.attributes = this.pick(this.permittedAttributes());

    // // Store the previous attributes so we can tell what was updated later
    // this._updatedAttributes = newObj.previousAttributes();
    this.set('updated_by', this.contextUser(options));
  },

  autoAttributes: function autoAttributes() {
    return [
      "id",
      "created_at",
      "created_by",
      "updated_at",
      "updated_by"
    ]
  },

  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true
    }, options);
    return _.omitBy(_.omit(this.toJSON(options), this.constructor.secretAttributes()), _.isNull);
  }

}, {
  secretAttributes: function secretAttributes() {
    return [];
  }
});

bookshelfInst.Collection = bookshelfInst.Collection.extend({
  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true
    }, options);
    return _.invokeMap(this.models, 'toClientJSON', options).filter(_.negate(_.isNull));
  }
});

module.exports = bookshelfInst;
