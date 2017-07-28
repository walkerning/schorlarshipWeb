// init the tables;
var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

var initData = {
  Group: [
    {
      name: "1900",
      description: "1900级教师",
      type: "faculty"
    },
    {
      name: "1900",
      description: "1900级本科生",
      type: "undergraduate"
    }
  ],
  User: [
    {
      name: "root",
      student_id: "0",
      group_id: 1,
      email: "root@localhost.com",
      password: "root123456",
      phone: "18888888888",
      class: "无00",
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
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 1,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "科技创新优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 2,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "社会工作优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 3,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "社会实践优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 4,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "公益活动优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 5,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "文艺优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 6,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "体育优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 7,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "学习进步奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 8,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    },
    {
      name: "综合优秀奖",
      year: "1900",
      start_time: "1900-06-27T06:31:09.0000",
      end_time: "1900-06-29T06:31:09.0000",
      form_id: 9,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        }
      ]
    }
  ],
  Form: [
    {
      name: "学业优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“学业优秀奖”是指在专业学习、学科竞赛、学术研究等方面获得优异成绩或荣誉","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年学科竞赛获奖情况","content":["时间","奖项名称","授予单位"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年发表论文（正式发表或接受函）和专利专著类","content":["作者（按次序列出所有作者）","论文题目","刊物名称、年份、期数、页码"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"其他（如SRT获奖等）","content":null}]',
      template: null
    },
    {
      name: "科技创新优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“科技创新优秀奖”是指在校内外科技实践活动或比赛中获得优异成绩或荣誉，或积极投身创业，已经取得或者有潜在的社会或经济效益","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年科技赛事获奖情况","content":["时间","奖项名称","授予单位"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"科技创新创业项目简介","content":["项目名称","简介"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"其他","content":null}]',
      template: null
    },
    {
      name: "社会工作优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“社会工作优秀奖”是指在班级、年级或系级的学生组织中担任干部或骨干，或作为重大学生活动的主要组织者，为广大同学服务，获得优异成绩或荣誉","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年社会工作获奖情况","content":["时间","奖项名称","授予单位"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年社会工作参与情况","content":["起止时间","所在社会工作团体及职务","具体成绩","证明人","社会工作团体及职务","联系电话"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我评述","content":null}]',
      template: null
    },
    {
      name: "社会实践优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“社会实践优秀奖”是指在社会实践中作为主要完成人获得优异成绩或荣誉，或造成一定的社会影响","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年参加社会实践情况","content":["时间","支队名称","本人职务、贡献"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年社会实践获奖情况","content":["时间","所获奖项（包括所在支队获得的奖项）","颁发单位"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我陈述（实践经历的简要介绍，对实践工作的认识等）","content":null}]',
      template: null
    },
    {
      name: "公益活动优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“公益活动优秀奖”是指积极投身志愿服务或公益活动，累计参与时间长或次数多，或获得优异成绩或荣誉","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年志愿公益经历","content":["时间","内容"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年获得的相关奖励荣誉","content":["时间","名称","颁奖单位"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我评述（简述除上述项之外相关情况，如在志愿公益类组织中任职情况等）","content":null}]',
      template: null
    },
    {
      name: "文艺优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“文艺优秀奖”是指个人积极参加文艺活动，有一定的文艺特长，并在年级以上文艺活动中获得优异成绩或荣誉","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年文艺活动获奖情况","content":["时间","奖项名称","授予单位"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年参加艺术代表队情况","content":["时间","代表队名称","担任职务","证明人"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年文艺活动组织情况","content":["时间","活动名称","担任职务"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我陈述","content":null}]',
      template: null
    },
    {
      name: "体育优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“体育优秀奖”是指个人积极投身体育运动，参与体育比赛次数多，体育成绩优异，或在年级以上体育比赛中获得荣誉","content":null},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年体育获奖情况","content":["时间","奖项名称","授予单位"]},{"type":11,"max_len":-1,"min_len":0,"required":true,"description":"上一学年体育代表队参加情况","content":["起止时间","所在代表队及职务","具体成绩","证明人","代表队及职务","联系电话"]},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我陈述","content":null}]',
      template: null
    },
    {
      name: "学习进步奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"“学习进步奖”是指通过自身努力使学习成绩相比之前有大幅度提高","content":null},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"个人陈述（学习态度、学习方法方面的改进或转变及取得的成绩）","content":null}]',
      template: null
    },
    {
      name: "综合优秀奖申请表",
      type: "apply",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"获得一项学业类优秀奖（学业优秀奖、学习进步奖）和一项非学业类优秀奖（科技创新优秀奖、公益活动优秀奖、社会工作优秀奖、文艺优秀奖、体育优秀奖、社会实践优秀奖），或者三项及以上优秀奖，可参评综合优秀奖学金","content":null},{"type":6,"max_len":-1,"min_len":0,"required":false,"description":"自我陈述","content":null}]',
      template: null
    },
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
