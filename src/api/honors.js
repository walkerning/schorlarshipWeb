var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var errors = require("../errors")
var logging = require("../logging")

module.exports={
  list:function list(req, res, next){
    var queries=req.query;
    return models.Honors.getByQuery(queries,["groups"])
      .then(function(collection){
        res.json(collection.toClientJSON());
        return null;
      })
  },

  info: function info(req, res, next){
    return models.Honor
      .getById(req.params.honorId,{fetchOptions:{withRelated:['groups']}})
        .then(function(honor){
          res.status(200).json(honor.toClientJSON());
      })

  },

}
