var l = require("lodash");

var modelNames = [
  "forms",
  "honors",
  "permissions",
  "scholars",
  "users",
  "users_honors",
  "users_scholars",
  "reasons",
  "users_reasons",
  "notices"
];

exports = module.exports;

function init() {
  modelNames.forEach(function(name) {
    l.extend(exports, require("./" + name));
  });
}
;

module.exports.init = init;
