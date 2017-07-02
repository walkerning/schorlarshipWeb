var _ = require("lodash")
var Promise = require("bluebird")
var util = require("util")
var models = require("../models")
var logging = require("../logging")

module.exports={
  list:function (req, res ,next) {
    return models.Scholars.getByQuery(req.query)
      .then(function(scholars){
          res.status(200).json(scholars.toClientJSON())
      })
  },
    
  info:function (req, res, next) {
    return models.Scholar
      .getById(req.params.scholarId, {fetchOptions: {withRelated: ["groups"]}})
      .then(function(scholar) {
        res.status(200).json(scholar.toClientJSON());
      })
  },
    
  create:function (req, res, next) {
        
  },
    
  updateInfo:function (req, res, next) {
        
  },
    
  delete:function (req, res, next) {
        
  }
};