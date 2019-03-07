const nodemailer = require("nodemailer");
const transport = require("nodemailer-mailgun-transport");
const options = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const client = nodemailer.createTransport(transport(options));

module.exports.sendConfirmationEmail = async ({ to, url }) => {
  const msg = {
    from: "Your Name <you@youremail.com>",
    to,
    subject: "Verify your account",
    html: `Visit the link below to verify your account:<br>${url}`
  };
  await client.sendMail(msg, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
