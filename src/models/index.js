var l = require("lodash");

modelNames = [
  "forms",
  "honors",
  "permissions",
  "scholars",
  "users",
  "users_honors",
  "users_scholars"
];

exports = module.exports;

function init() {
  modelNames.forEach(function(name) {
    l.extend(exports, require("./" + name));
  });
}
;

module.exports.init = init;
