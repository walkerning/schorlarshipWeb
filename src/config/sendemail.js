// https://github.com/sendgrid/sendgrid-nodejs
var helper = require("sendgrid").mail;
var sendgrid = require("sendgrid")(process.env.SENDGRID_API_KEY);
var from_email = new helper.Email("no_reply_scholarweb_ee@mail.tsinghua.edu.cn")

function renderEmail(content) {
  // TODO: render a good-looking email
  return content;
}

function sendEmail(dstEmail, subject, content) {
  // TODO: content type: text/html; charset=utf-8
  var _content = new helper.Content('text/plain', content);
  var to_email = new helper.Email(dstEmail);
  var mail = new helper.Mail(from_email, subject, to_email, _content);
  // TODO: log sending email activities
  var request = sendgrid.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON()
  });
  return sendgrid.API(request);
}

module.exports = {
  renderEmail: renderEmail,
  sendEmail: sendEmail
};

