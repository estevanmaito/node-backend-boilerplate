const nodemailer = require("nodemailer");
const transport = require("nodemailer-sendgrid-transport");
const options = {
  auth: {
    api_user: process.env.SENDGRID_API_USER,
    api_key: process.env.SENDGRID_API_KEY
  }
};

const client = nodemailer.createTransport(transport(options));

module.exports.sendConfirmationEmail = async ({ to, subject, url }) => {
  const msg = {
    from: "estevan@unna.tech",
    to,
    subject,
    text: `Vai saber`,
    html: `Visit the link below to verify your account:<br>${url}`
  };
  await client.sendMail(msg, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};
