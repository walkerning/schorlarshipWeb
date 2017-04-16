var pv = require('password-validator');
var passwordValidator = new pv();

passwordValidator
  .isMin(8)
  .isMax(30)
  .has().digits()
  .not().spaces();
  //.has().letters()


module.exports = {
  passwordValidator: passwordValidator
};
