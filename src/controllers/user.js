const yup = require("yup");
const { EMAIL_DUPLICATE } = require("../utils/errorMessages");
const { createConfirmEmailURL } = require("../utils/createConfirmEmailURL");
const { sendConfirmationEmail } = require("../utils/sendConfirmationEmail");
const { formatErrorMessage } = require("../utils/formatErrorMessage");
const redis = require("../utils/redis")();
const User = require("../models/User");

const schema = yup.object().shape({
  email: yup
    .string()
    .min(4)
    .max(100)
    .email(),
  password: yup
    .string()
    .min(6)
    .max(40)
});

exports.postSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    await schema.validate({ email, password }, { abortEarly: false });
  } catch (e) {
    return res.json(formatErrorMessage(e));
  }

  // checks if user already exists
  const userExists = await User.findOne({ email });
  console.log(userExists);

  if (userExists) {
    return res.json([
      {
        path: "email",
        message: EMAIL_DUPLICATE
      }
    ]);
  }

  // create a new user
  const user = new User({
    email,
    password
  });

  user.save(async (err, user) => {
    if (err) throw new Error("Cannot save user!");

    const link = await createConfirmEmailURL(req.hostname, user.id, redis);
    res.send(link);
    // const options = {
    //   to: user.email,
    //   subject: "Verify your account",
    //   url: link
    // };
    // await sendConfirmationEmail(options);
  });
};

exports.getConfirmEmail = async (req, res) => {
  const id = req.params.id;
  const userId = await redis.get(id);
  if (userId) {
    const user = await User.findByIdAndUpdate(userId, {
      confirmed: true
    });
    user.save();
    return res.send("Email validated");
  } else {
    return res.send("Invalid code");
  }
};
