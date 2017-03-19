var express = require("express");
var bodyParser = require("body-parser");
var morgan = require('morgan');

var logging = require("./logging");
var models = require("./models");
var apiRouter = require("./api");
var authHandler = require("./auth").auth;
var jwtMiddleware = require("./middlewares/jwt");
var readUserMiddleware = require("./middlewares/readUser");

models.init();

var app = express();

// PLUGIN: log requests
app.use(morgan("dev", {
  "stream": logging.stream
}));

// PLUGIN: JSON body parser: parse JSON payload into `req.body` attribute
app.use(bodyParser.json());

// PLUGIN: JWT: extract info from jwt-signed token
app.use(jwtMiddleware.unless({
  path: ["/auth"]
}));

// ROUTES: auth: verify the password, a jwt-signed token on success
app.post("/auth", authHandler);

// PLUGIN: set user: fetch the database, set `req.user` attribute to the context user
app.use("/v1/api", readUserMiddleware);

// ROUTES: api routes
app.use("/v1/api", apiRouter);

// The unify error handler. 
// @TODO: improve the error system
if (app.get("env") == "development") {
  app.use("/", function(err, req, res, next) {
    // FIXME: although now we keep the consistence of
    // our error objects towards the error object of jwt-express.
    // There is a chance that future middlewares will have different error
    // object difinition... it's really a mess
    if (!err) {
      // For 404
      err = new errors.NotFoundError();
    }
    console.log("error: ", err);
    if (err.status >= 100 && err.status < 600) {
      res.status(err.status);
    } else {
      res.status(500);
    }
    res.set({
      "Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    });
    res.json({
      message: err.message,
      name: err.name,
      trace: err
    });
  });
} else {
  app.use("/", function(err, req, res, next) {
    if (!err) {
      // For 404
      err = new errors.NotFoundError();
    }
    if (err.status >= 100 && err.status < 600) {
      res.status(err.status);
    } else {
      res.status(500);
    }
    res.set({
      "Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    });
    res.json({
      message: err.message,
      name: err.name
    });
  });
}

module.exports = app;
