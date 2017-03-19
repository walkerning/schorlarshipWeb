// init the tables;
var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

var initData = {
  Users: [
    {
      name: "admin_test",
      student_id: "2012011067",
      type: "undergraduate",
      email: "foxmail@gmail.com",
      password: "123"
    }
  ],
  Permissions: [
    "login",
    "user",
    "form",
    "honor",
    "scholar",
    "export"].map(function(name) {
    return {
      name: name
    };
  }),
};

function initTables() {
  return Promise.mapSeries(_.keys(initData), function initDatum(dataName) {
    return Promise.mapSeries(initData[dataName], function initInfo(info) {
      return models[dataName].forge(_.omit(info, models[dataName].secretAttributes()))
        .fetch()
        .then(function(item) {
          if (!item) {
            return models[dataName].forge(info)
              .save()
              .then(function(item) {
                logging.info("Created " + dataName.toLowerCase() + ": "
                  + item.get("id") + " - " + item.get("name"));
              });
          } else {
            return Promise.resolve(null);
          }
        });
    })
      .then(function() {
        logging.info("Table " + dataName + " initialized!");
      });
  });
}

initTables().then(function() {
  logging.info("All tables initialized!");
  process.exit(0);
}).catch(function(error) {
  logging.error("Failure when initializing tables:", error);
  process.exit(1);
});
