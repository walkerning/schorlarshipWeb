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

  // Helpers for permissions, validations and permitted attributes(for filtering)
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
                message: "Illegal `" + key + "`: uplicated. `" + self.get(key) + "` already exists."
              }));
            }
            return Promise.resolve();
          });
      } else {
        return Promise.resolve();
      }
    });
  },

  permittedAttributes: function permittedAttribute() {
    return _.keys(schema[this.tableName]);
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

  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    // Default: return all non-auto attributes
    return _.difference(this.permittedAttributes(), this.autoAttributes());
  },

  contextUser: function contextUser(options) {
    if (options.context && options.context.contextUser) {
      return options.context.contextUser.get("id");
    } else {
      return 0;
    }
  },

  // `initialize` - constructor for model creation
  initialize: function initialize() {
    this.on("creating", this.onCreating);
    this.on("fetching", this.onFetching);

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

  // Database interaction event handling
  onValidate: function onValidate() {
    return validation.validateSchema(this.tableName, this.toJSON(), this.autoAttributes());
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

  onFetching: function onFetching(models, columns, options) {
    _.mergeWith(options, {
      withRelated: this.constructor.fetchInlineRelations()
    }, function(dstValue, srcValue) {
      if (_.isArray(dstValue)) {
        return _.union(dstValue, srcValue);
      }
    });
  },

  // Operation methods used by API.
  /** 
   * @returns {Promise<Model>}
   */
  update: function update(body, contextUser) {
    return this.save(_.pick(body, this.permittedUpdateAttributes(contextUser)), {
      context: {
        contextUser: contextUser
      }
    });
  },

  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true
    }, options);
    this.constructor
    return _.omitBy(_.omit(this.toJSON(options), this.constructor.secretAttributes()), _.isNull);
  }

}, {
  /**
   * @returns {Promise<Model>}
   */
  getById: function getById(id, options) {
    return this.forge({
      id: id
    })
      .fetch()
      .then(function(mod) {
        if (!mod && (options === undefined || options.noreject !== true)) {
          return Promise.reject(new errors.NotFoundError({
            message: "This id: `" + id + "` does not exists."
          }));
        } else {
          return mod;
        }
      });
  },

  /** 
   * @returns {Promise<Model>}
   */
  create: function create(body, contextUser) {
    var fields = contextUser.permittedUpdateAttributes(contextUser);
    return this.forge(_.pick(body, fields)).save({}, {
      context: {
        contextUser: contextUser
      }
    });
  },

  secretAttributes: function secretAttributes() {
    return [];
  },

  fetchInlineRelations: function fetchInlineRelations() {
    return [];
  }
});

bookshelfInst.Collection = bookshelfInst.Collection.extend({
  initialize: function initialize() {
    this.on("fetching", this.onFetching);
  },

  // Database interaction event handling
  onFetching: function onFetching(models, columns, options) {
    _.mergeWith(options, {
      withRelated: this.model.fetchInlineRelations()
    }, function(dstValue, srcValue) {
      if (_.isArray(dstValue)) {
        return _.union(dstValue, srcValue);
      }
    });
  },

  // Operation methods used by API.
  toAttrList: function toAttrList(attrName) {
    if (_.isString(attrName)) {
      return _.map(this.toJSON(), function(v) {
        return v[attrName]
      })
    } else if (_.isArray(attrName)) {
      return _.map(this.toJSON(), function(v) {
        _.map(attrName, function(name) {
          return v[attrName]
        });
      });
    }
  },

  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true
    }, options);
    return _.invokeMap(this.models, 'toClientJSON', options).filter(_.negate(_.isNull));
  },

}, {
  queriableAttributes: function queriableAttributes() {
    return ["id"];
  },

  // Operation methods used by API.
  /** 
   * @returns {Promise<Collection>}
   */
  getByQuery: function getByQuery(query) {
    return this.forge()
      .query({
        where: _.pick(query, this.queriableAttributes())
      })
      .fetch();
  }
});

module.exports = bookshelfInst;
