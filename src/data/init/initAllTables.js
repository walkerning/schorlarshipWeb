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
      name: "user_honor",
      description: "User-Honor states management permission."
    },
    {
      name: "user_scholar",
      description: "User-Scholar states management permission."
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
    {
      name: "notice",
      description: "Notice management permission."
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
      template: '{"content":[{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IChElDQ19QUk9GSUxFAAEBAAACdGFwcGwEAAAAbW50clJHQiBYWVogB9wACwAMABIAOgAXYWNzcEFQUEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsZkn52TyFd5+0BkqZHjp0LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALZGVzYwAAAQgAAABjZHNjbQAAAWwAAAAsY3BydAAAAZgAAAAtd3RwdAAAAcgAAAAUclhZWgAAAdwAAAAUZ1hZWgAAAfAAAAAUYlhZWgAAAgQAAAAUclRSQwAAAhgAAAAQYlRSQwAAAigAAAAQZ1RSQwAAAjgAAAAQY2hhZAAAAkgAAAAsZGVzYwAAAAAAAAAJSEQgNzA5LUEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAEAAAABwASABEACAANwAwADkALQBBdGV4dAAAAABDb3B5cmlnaHQgQXBwbGUgQ29tcHV0ZXIsIEluYy4sIDIwMTAAAAAAWFlaIAAAAAAAAPNSAAEAAAABFs9YWVogAAAAAAAAb6EAADkjAAADjFhZWiAAAAAAAABilgAAt7wAABjKWFlaIAAAAAAAACSeAAAPOwAAts5wYXJhAAAAAAAAAAAAAfYEcGFyYQAAAAAAAAAAAAH2BHBhcmEAAAAAAAAAAAAB9gRzZjMyAAAAAAABDEIAAAXe///zJgAAB5IAAP2R///7ov///aMAAAPcAADAbP/AABEIAPcDUQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgMCAgMFAwMDBQYFBQUFBggGBgYGBggKCAgICAgICgoKCgoKCgoMDAwMDAwODg4ODg8PDw8PDw8PDw//2wBDAQICAgQEBAcEBAcQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/3QAEADb/2gAMAwEAAhEDEQA/AP38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9D9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//R/fyiiigAooooAKKKKACiiigAorgfHnxS+H3w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b8Y968x1P/goJ8Y/EkhsvBPhjT7WST5VCRz382T0wFKDP/ATX6VaZ8A/gnpBDaf4F0aMgkgmxhc5IweXUnpXpOm6No+jxGHSLGCxjP8ADBEsS/koFL6/gYfBQv6v/hxfXsFH4KN/V/8ADn46vo/7dnxzXyr86rY6dcDkTMmj2xU+qKI3cf8AAWr1j4f/APBOiMNHf/FHxMZGJ3PaaWuAfZriUZPviMfWv1EoqKnEFa3LSSgvJEVM+q25aSUF5I81+Hnwf+G3wqszZ+BNCt9MLqFknC77iXH/AD0mfMjfQnHoK9KoorxalSU3zSd2ePOpKT5pO7CiiioICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//1v38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9k=", "width": 313, "alignment": "center"}, {"canvas": [{"type": "line", "x1": 40, "y1": 5, "x2": 475, "y2": 5, "lineWidth": 1}]}, {"text": "尊敬的张维德先生:", "style": "appellation"}, {"text": "{{data1}}", "style":"text", "preserveLeadingSpaces": true}, {"text": "{{data2}}", "alignment": "right", "style": "text", "margin": [40, 10, 40, 0]}, {"text": "{{data3}}", "alignment": "right", "style": "text"}, {"text": "电子工程系", "alignment": "right", "style": "text"}, {"text": "{{data4}}年{{data5}}月{{data6}}日", "alignment": "right", "style": "text"}], "styles": {"appellation": {"margin": [40, 20, 40, 5], "fontSize": 12, "lineHeight": 1.6}, "text": {"alignment": "justify", "margin": [40, 0], "lineHeight": 1.6}}}'
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
