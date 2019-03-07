const yup = require("yup");
const {
  EMAIL_DUPLICATE,
  LOGIN_INVALID,
  LOGIN_NOT_VERIFIED,
  LOGIN_ALREADY_VERIFIED
} = require("../utils/errorMessages");
const { createConfirmEmailURL } = require("../utils/createConfirmEmailURL");
const { sendConfirmationEmail } = require("../utils/sendConfirmationEmail");
const { formatErrorMessage } = require("../utils/formatErrorMessage");
const redis = require("../utils/redis")();
const uuidValidate = require("uuid-validate");
const User = require("../models/User");

/** POST /signup
 * Create a new local account
 */
exports.postSignup = async (req, res) => {
  const signupSchema = yup.object().shape({
    email: yup.string().min(4).max(100).email(), // prettier-ignore
    password: yup.string().min(6).max(40) // prettier-ignore
  });

  const { email, password } = req.body;

  try {
    await signupSchema.validate({ email, password }, { abortEarly: false });
  } catch (e) {
    return res.json(formatErrorMessage(e));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.json([
      {
        path: "email",
        message: EMAIL_DUPLICATE
      }
    ]);
  }

  const user = new User({
    email,
    password
  });

  user.save(async (err, user) => {
    if (err) throw new Error("Cannot save user!");

    const link = await createConfirmEmailURL(req.hostname, user.id, redis);
    const options = {
      to: user.email,
      url: link
    };
    await sendConfirmationEmail(options);
    res.send("Check your email to verify your account");
  });
};

/** GET /confirmation/:id
 * Verify user account
 */
exports.getConfirmationEmail = async (req, res) => {
  const uuid = req.params.id;
  const isValidUUID = uuidValidate(uuid);

  if (!isValidUUID) return res.send("Invalid validation code");

  const userId = await redis.get(uuid);

  if (userId) {
    const user = await User.findByIdAndUpdate(userId, {
      isVerified: true
    });
    user.save();
    await redis.del(uuid);
    return res.send("Email validated");
  } else {
    return res.send("Invalid validation code");
  }
};

/** POST /resend-confirmation
 * Resend account confirmation
 */
exports.postResendConfirmation = async (req, res) => {
  const email = req.body.email;

  // invalid email format - stop processing
  const schema = yup.object().shape({
    email: yup.string().min(4).max(100).email() // prettier-ignore
  });

  try {
    await schema.validate({ email }, { abortEarly: false });
  } catch (e) {
    return res.json(formatErrorMessage(e));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json([
      {
        path: "email",
        message: LOGIN_INVALID
      }
    ]);
  }

  if (user.isVerified) {
    return res.json([
      {
        path: "email",
        message: LOGIN_ALREADY_VERIFIED
      }
    ]);
  }

  const link = await createConfirmEmailURL(req.hostname, user.id, redis);
  const options = {
    to: user.email,
    url: link
  };
  await sendConfirmationEmail(options);
  res.send("Check your email to verify your account");
};

/** POST /login
 * Sign in user
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  // TODO: ADD VALIDATION

  const user = await User.findOne({ email });

  if (!user) {
    return res.json([
      {
        path: "email",
        message: LOGIN_INVALID
      }
    ]);
  }

  if (!user.isVerified) {
    return res.json([
      {
        path: "email",
        message: LOGIN_NOT_VERIFIED
      }
    ]);
  }

  const hasValidPassword = await user.comparePassword(password, user.password);

  if (!hasValidPassword) {
    return res.json([
      {
        path: "email",
        message: LOGIN_INVALID
      }
    ]);
  }

  return res.json({ login: "successful" });
};
