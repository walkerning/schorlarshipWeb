var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var cors = require("cors");
var compression = require("compression");
var helmet = require("helmet");
var RateLimit = require('express-rate-limit');

var logging = require("./logging");
var models = require("./models");
var apiRouter = require("./api");
var authHandler = require("./auth").auth;
var jwtMiddleware = require("./middlewares/jwt");
var readUserMiddleware = require("./middlewares/readUser");

models.init();

var app = express();

// PLUGIN: enable CORS requests. **TODO**: only for development, all
// cross-domain requests are enabled
app.use(cors())

// PLUGIN: log requests
app.use(morgan("dev", {
  "stream": logging.stream
}));

// PLUGIN: securing application from some attacks
app.use(helmet());

// PLUGIN: gzip compression, compacting the json responses
app.use(compression());

// Serve static attachment files
var attachment_basename = process.env.JXJ_ATTACHMENT_BASENAME;
if (!attachment_basename) {
  logging.error("REQUIRE `JXJ_ATTACHMENT_BASENAME` environment variable. EXIT!");
  process.exit(1);
}

// Actually served by nginx in production.
app.use("/static/attachments/", express.static(attachment_basename));

// PLUGIN: JSON body parser: parse JSON payload into `req.body` attribute
app.use(bodyParser.json());

// PLUGIN: JWT: extract info from jwt-signed token
app.use(jwtMiddleware.unless({
  path: ["/auth"]
}));

// PLUGIN: rate limiter for each IP
var limiter = new RateLimit({
  windowMs: 60*1000, // 1 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});
app.use(limiter);

// ROUTES: auth: verify the password, a jwt-signed token on success
app.post("/auth", authHandler);

// PLUGIN: set user: fetch the database, set `req.user` attribute to the context user
app.use("/api/v1", readUserMiddleware);

// ROUTES: api routes
app.use("/api/v1", apiRouter);

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
    var message = err.message;
    if (err.code == "ER_DUP_ENTRY") {
      message = "Create resource fail, duplicated entry exists.";
      err.status = 400;
    }
    logging.error("error: ", err);
    console.log(err);
    if (err.status >= 100 && err.status < 600) {
      res.status(err.status);
    } else {
      res.status(500);
    }
    res.set({
      "Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    });
    res.json({
      message: message,
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
    console.log(err);
    var message = err.message;
    if (err.code == "ER_DUP_ENTRY") {
      err = new errors.ValidationError({
        message: "Create resource fail, duplicated entry exists."
      });
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
