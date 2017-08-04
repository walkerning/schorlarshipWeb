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
    },
    {
      name: "1900",
      description: "1900级研究生",
      type: "graduate"
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
    {
      name: "国家奖学金感谢信",
      type: "thanks",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"请根据邮件要求填写国家奖学金征文","content":null}]',
      template: null
    },
    {
      name: "系设奖学金感谢信",
      type: "thanks",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"该奖学金不用填写感谢信","content":null}]',
      template: null
    },
    {
      name: "清华校友－张维国励学基金感谢信",
      type: "thanks",
      fields: '[{"type":1,"max_len":-1,"min_len":0,"required":true,"description":"    感谢信内容为：我叫清小华，来自***，……。感谢信正文应该包括本人的基本情况，例如：姓名、性别、民族、年级、专业、籍贯等；家庭的基本情况，包括：家住城镇还是农村、父母的职业、家庭人口、目前的经济状况如何等（获助学金、励学金的同学必写）；汇报上一学年来的学习、生活、参加各项活动（特别是公益活动）的情况，取得的成绩；获得该项助学金或励学金后的感受及想法，如该项助学金或者励学金是连续的，请写清是连续几年；结束语以及良好的祝愿。感谢信字数不少于1000字。\\n\\n    同学们，助学金是由清华大学校友和社会各界人士捐赠，因此当饮水思源，写一封信来表达对捐助者或者捐助机构的感谢之情。感谢信理应真情流露，切勿抄袭，这是对捐助者最基本的尊重，也是受助者应当守住的底线。另外书写完毕请检查是否有语句不通顺的地方和错别字。\\n","content":null},{"type":6,"max_len":-1,"min_len":0,"required":true,"description":"感谢信内容","content":null},{"type":5,"max_len":-1,"min_len":0,"required":true,"description":"姓名","content":null},{"type":5,"max_len":-1,"min_len":0,"required":true,"description":"班级（如“无37班”）","content":null},{"type":2,"max_len":-1,"min_len":0,"required":true,"description":"年","content":null},{"type":2,"max_len":-1,"min_len":0,"required":true,"description":"月","content":null},{"type":2,"max_len":-1,"min_len":0,"required":true,"description":"日","content":null}]',
      template: '<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/paper-css/0.3.0/paper.css"><style>@page { size: A4 }</style><title>打印</title></head><body class="A4"><section class="sheet padding-20mm"><table cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-left:auto; margin-right:auto;"><tbody><tr style="height:78pt"><td style="border-bottom-color:#000000; border-bottom-style:solid; border-bottom-width:2.25pt; padding-left:5.4pt; padding-right:5.4pt; vertical-align:top; width:421.2pt"><p style="margin:0pt 0pt 0pt 24.8pt; orphans:0; text-align:center; widows:0"><img src="data:image/png;base64,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" width="97" height="89" alt="" style="-aw-left-pos:0pt; -aw-rel-hpos:column; -aw-rel-vpos:paragraph; -aw-top-pos:0pt; -aw-wrap-type:inline" /><img src="data:image/png;base64,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" width="285" height="86" alt="" style="-aw-left-pos:0pt; -aw-rel-hpos:column; -aw-rel-vpos:paragraph; -aw-top-pos:0pt; -aw-wrap-type:inline" /></p></td></tr></tbody></table><div style="padding-left:8mm;padding-right:8mm">  <p style="font-size:14pt; line-height:150%; margin:0pt; orphans:0; widows:0"><span style="font-family:宋体; font-size:14pt">&nbsp;</span></p> <p style="line-height:20pt; margin:0pt; orphans:0; widows:0"><span style="font-family:宋体; font-size:12pt">尊敬的张维国学长：</span></p>  <p style="line-height:20pt; margin:0pt; orphans:0; text-align:justify; text-indent:24pt; widows:0"><span style="font-family:宋体; font-size:12pt">您好！</span></p>  <pre style="line-height:20pt; margin:0pt; orphans:0; widows:0; font-family:宋体; font-size:12pt;white-space: pre-wrap;word-wrap: break-word;">{{data1}}</pre> <p style="font-size:14pt; line-height:150%; margin:0pt; orphans:0; widows:0"><span style="font-family:宋体; font-size:14pt">&nbsp;</span></p> <p style="margin:0pt; orphans:0; text-align:right; text-indent:24pt; widows:0"><span style="font-family:宋体; font-size:12pt">{{data2}}</span></p>  <p style="margin:0pt; orphans:0; text-align:right; text-indent:24pt; widows:0"><span style="font-family:宋体; font-size:12pt">{{data3}}</span></p>  <p style="margin:0pt; orphans:0; text-align:right; text-indent:24pt; widows:0"><span style="font-family:宋体; font-size:12pt">电子工程系</span></p>  <p style="margin:0pt; orphans:0; text-align:right; text-indent:24pt; widows:0"><span style="font-family:宋体; font-size:12pt">{{data4}}年{{data5}}月{{data6}}日</span></p> </div></section></body></html>'
      }
  ],
  Scholar: [
    {
      name: "国家奖学金",
      year: "1900",
      form_id: 10,
      alloc: "quota",
      money: 8000,
      group_quota: [
        {
          group_id: 2,
          quota: 5
        },
        {
          group_id: 3,
          quota: 10
        }
      ]
    },    
    {
      name: "系设奖学金",
      year: "1900",
      form_id: 11,
      alloc: "money",
      money: null,
      group_quota: [
        {
          group_id: 2,
          quota: 50000
        },
        {
          group_id: 3,
          quota: 10000
        }
      ]
    },    
    {
      name: "清华校友－张维国励学基金",
      year: "1900",
      form_id: 12,
      alloc: "money",
      money: null,
      group_quota: [
        {
          group_id: 2,
          quota: 50000
        },
        {
          group_id: 3,
          quota: 10000
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
