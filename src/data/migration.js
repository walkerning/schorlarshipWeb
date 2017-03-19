var Promise = require("bluebird");
var argv = require("minimist")(process.argv.slice(2));
var logging = require("../logging");
var commands = require("./commands");
var schema = require("./schema");
var _ = require("lodash");

var tableNames = _.keys(schema);

function dropTables() {
  return Promise.mapSeries(tableNames, function dropTable(tableName) {
    return commands.dropTable(tableName);
  });
}

function createTables() {
  return Promise.mapSeries(tableNames, function createTable(tableName) {
    logging.info("Creating table: " + tableName);
    return commands.createTable(tableName);
  });
}

var start = Promise.resolve(null);
if (argv.reinit) {
  start = dropTables()
    .then(function() {
      logging.info("All tables droped");
    })
    .catch(function() {
      logging.error("Failure when dropping tables: ", error);
      process.exit(1);
    });
}

start.then(function() {
  return createTables().then(function() {
    logging.info("All tables created!");
    process.exit(0);
  })
    .catch(function(error) {
      logging.error("Failure when creating tables: ", error);
      process.exit(1);
    });
});

