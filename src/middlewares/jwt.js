var expressJwt = require("express-jwt");
var config = require("../config").jwt;
config["requestProperty"] = "auth";

module.exports = expressJwt(config);
