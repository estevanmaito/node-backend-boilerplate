const nodemailer = require("nodemailer");
const transport = require("nodemailer-mailgun-transport");
const options = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const client = nodemailer.createTransport(transport(options));

module.exports.sendEmail = async ({ from, to, subject, html }) => {
  const msg = {
    from,
    to,
    subject,
    html
  };
  await client.sendMail(msg, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
