var pv = require('password-validator');
var passwordValidator = new pv();

passwordValidator
  .isMin(8)
  .isMax(30)
  .has().letters()
  .has().digits()
  .not().spaces();

module.exports = {
  passwordValidator: passwordValidator
};
