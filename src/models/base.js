var Promise = require("bluebird");
var _ = require("lodash");
var bookshelf = require("bookshelf");
var util = require("util");
var db = require("../data").db;
var schema = require("../data").schema;
var validation = require("../data").validation;
var errors = require("../errors");

var bookshelfInst;

bookshelfInst = bookshelf(db);
bookshelfInst.plugin("registry");

// Helpers
_getJSONAttrList:
function _getJSONAttrList(json, attrName) {
  if (_.isString(attrName)) {
    return json[attrName];
  } else if (_.isArray(attrName)) {
    return _.map(attrName, function(name) {
      return json[attrName];
    });
  }
}

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
                message: "Illegal `" + key + "`: Duplicated. `" + self.get(key) + "` already exists."
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
    var newBody = _.pick(body, this.permittedUpdateAttributes(contextUser));
    if (_.isEmpty(newBody)) {
      // Avoid unneccessary update to `updated_at` field.
      return Promise.resolve(null);
    }
    return this.save(newBody, {
      context: {
        contextUser: contextUser
      }
    });
  },

  // By default, the relations objects will be flatten using `name` fields,
  // to get full relations objects, pass in `{flattenRelation: false}` option
  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true,
      flattenRelation: true
    }, options);

    var json = _.omitBy(_.omit(this.toJSON(options), this.constructor.secretAttributes()), _.isNull);
    if (options.flattenRelation) {
      _.forEach(_.keys(this.relations), function(key) {
        if (json[key]) {
          if (_.isArray(json[key])) {
            json[key] = _.map(json[key], (v) => v.name || v.id);
          } else {
            json[key] = json[key].name || json[key].id;
          }
        }
      });
    }
    return json;
  }

}, {
  /**
   * @returns {Promise<Model>}
   */
  getById: function getById(id, options) {
    if (options !== undefined) {
      var fetchOpt = options.fetchOptions;
    }
    return this.forge({
      id: id
    })
      .fetch(fetchOpt)
      .then(function(mod) {
        if (!mod && (options === undefined || options.noreject !== true)) {
          return Promise.reject(new errors.NotFoundError({
            message: util.format("`id`(%s) not exists.", id)
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
    return this.forge(body).save({}, {
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
    return _.map(this.toJSON(), (json) => _getJSONAttrList(json, attrName));
  },

  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true,
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
