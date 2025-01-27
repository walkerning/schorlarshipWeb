var jwt = require("jsonwebtoken");
var errors = require("./errors");
var config = require("./config").jwt;
var models = require("./models");
var Promise = require("bluebird");

function createToken(user) {
  return jwt.sign({
    id: user.id
  }, config.secret, {
    expiresIn: 60 * 60 * 24,
    issuer: config.issuer
  });
}

module.exports = {
  auth: function(req, res, next) {
    if (req.body.student_id === undefined) {
      return next(new errors.BadRequestError({
        message: "`student_id` field is required."
      }));
    }
    models.User.forge({
      student_id: req.body.student_id
    })
      .fetch()
      .then(function(user) {
        if (!user) {
          return next(new errors.UnauthorizedError({
            message: "Student ID do not exists."
          }));
        } else {
          return user.isPasswordCorrect(req.body.password, user.get("password"))
            .then(function then() {
              // send the JWT token to the client
              return res.json({
                user: user.toClientJSON(),
                token: createToken(user)
              });
            }, function then(err) {
              return next(new errors.UnauthorizedError({
                message: err.message
              }));
            });
        }
      })
      .catch(function(err) {
        return next(new errors.InternalServerError(
          {
            message: err
          }
        ));
      });
  }
};
