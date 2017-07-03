// init the tables;
var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

var initData = {
  Group: [
    {
      name: "2012",
      description: "2012级本科生",
      type: "undergraduate"
    },
    {
      name: "2013",
      description: "2013级本科生",
      type: "undergraduate"
    },
    {
      name: "2014",
      description: "2014级本科生",
      type: "undergraduate"
    }
  ],
  User: [
    {
      name: "admin_test",
      student_id: "2012011067",
      group_id: 1,
      email: "foxmail@gmail.com",
      password: "ning12345678",
      phone: "18311111111",
      class: "无23",
      active: true
    }
  ],
  Permission: [
    {
      name: "login",
      description: "Login permission."
    },
    {
      name: "apply",
      description: "Apply for honor/scholarship permission."
    },
    {
      name: "user",
      description: "User management permission."
    },
    {
      name: "form",
      description: "Form management permission."
    },
    {
      name: "honor",
      description: "Honor management permission."
    },
    {
      name: "scholar",
      description: "Scholar management permission."
    },
    {
      name: "export",
      description: "Information exporting permission."
    },
    {
      name: "permission",
      description: "Permission management permission."
    },
  ],
  Honor: [
    {
      name: "学业优秀奖",
      year: "2016",
      start_time: "2017-06-27T06:31:09.0000",
      end_time: "2017-06-29T06:31:09.0000",
      form_id: 2,
      group_quota: [
        {
          group_id: 1,
          quota: 5
        },
        {
          group_id: 2,
          quota: 10
        }
      ]
    }
  ],
  Scholar: [
    {
      name: "校设奖学金",
      year: "2016",
      form_id: 5,
      alloc: "quota",
      money: 1000,
      group_quota: [
        {
          group_id: 1,
          quota: 5
        },
        {
          group_id: 2,
          quota: 10
        }
      ]
    }
  ],
};

function initTables() {
  return Promise.mapSeries(_.keys(initData), function initDatum(dataName) {
    return Promise.mapSeries(initData[dataName], function initInfo(info) {
      //return models[dataName].forge(_.omit(info, models[dataName].secretAttributes()))
      //.fetch()
      //  .then(function(item) {
      //if (!item) {
      // return models[dataName].forge(info)
      //   .save(null, {method: "insert"})
      return models[dataName].create(info, null)
        .then(function(item) {
          logging.info("Created " + dataName.toLowerCase() + ": "
                       + item.get("id") + " - " + item.get("name"));
        });
      //} else {
      //return Promise.resolve(null);
      //}
      //});
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
