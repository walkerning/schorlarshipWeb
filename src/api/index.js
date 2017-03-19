var express = require("express");
var errors = require("../errors");
var permit = require("../middlewares/permission");
var users = require("./users");
var apiRouter = express.Router();

function catchError(apiFunc) {
  return function(req, res, next) {
    try {
      apiFunc(req, res, next)
        .catch(function(err) {
          next(err);
        });
    } catch ( err ) {
      next(new errors.InternalServerError({
        stack: err
      }));
    }
  };
}

apiRouter.get("/users", permit(["user"]), catchError(users.list));
apiRouter.post("/users", permit(["user"]), catchError(users.create));
apiRouter.get("/users/:userId", permit(["me"], ["user"]), catchError(users.info));
apiRouter.put("/users/:userId", permit(["me"], ["user"]), catchError(users.updateInfo));
apiRouter.delete("/users/:userId", permit(["user"]), catchError(users.delete));

module.exports = apiRouter;
