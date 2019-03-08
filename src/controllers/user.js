const yup = require("yup");
const {
  EMAIL_DUPLICATE,
  LOGIN_INVALID,
  LOGIN_NOT_VERIFIED,
  LOGIN_ALREADY_VERIFIED
} = require("../utils/errorMessages");
const { sendEmail } = require("../utils/sendEmail");
const { formatErrorMessage } = require("../utils/formatErrorMessage");
const redis = require("../utils/redis")();
const uuid = require("uuid/v4");
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

    const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
    const token = uuid();
    await redis.set(token, user.id, "ex", ONE_DAY_IN_SECONDS);

    const message = {
      from: "Your Name <your@email.com>",
      to: user.email,
      subject: "Verify your account",
      html: `<p>Click the link below to verify your email</p>
      <br>
      <a href="${
        req.hostname
      }/confirmation/${token}">Click here to verify your account</a>`
    };
    await sendEmail(message);
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

  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  const token = uuid();
  await redis.set(token, user.id, "ex", ONE_DAY_IN_SECONDS);

  const message = {
    from: "Your Name <your@email.com>",
    to: user.email,
    subject: "Verify your account",
    html: `<p>Click the link below to verify your email</p>
    <br>
    <a href="${
      req.hostname
    }/confirmation/${token}">Click here to verify your account</a>`
  };
  await sendEmail(message);
  res.send("Check your email to verify your account");
};

/** POST /login
 * Sign in user
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  // don't even botter the DB if conditions not met
  const schema = yup.object().shape({
    email: yup.string().min(4).max(100).email(), // prettier-ignore
    password: yup.string().min(6).max(40) // prettier-ignore
  });

  try {
    await schema.validate({ email, password }, { abortEarly: false });
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

  req.session.userId = user.id;

  return res.json({ login: "successful" });
};

/** POST /logout
 * Sign out user
 */
exports.postLogout = async (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error on logout, try again");

    return res.send("Logged out successfuly");
  });
};

/** POST /forgot-password
 * Send password reset email
 */
exports.postForgotPassword = async (req, res) => {
  const email = req.body.email;

  // don't even botter the DB if conditions not met
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

  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  const token = uuid();
  await redis.set(token, user.id, "ex", ONE_DAY_IN_SECONDS);

  const message = {
    from: "Your Name <your@email.com>",
    to: user.email,
    subject: "Password reset",
    html: `<p>Click the link below to reset your account's password.</p>
    <br>
    <a href="${
      req.hostname
    }/reset-password/${token}">Click here to reset your password</a>`
  };
  await sendEmail(message);
  res.send("Check your email to reset your password");
};

/** POST /reset-password/:id
 * Verify password reset token and update password
 */
exports.postResetPassword = async (req, res) => {
  //check uuid
  const uuid = req.params.id;
  const isValidUUID = uuidValidate(uuid);

  if (!isValidUUID) return res.send("Invalid password reset token");

  // check new password
  const signupSchema = yup.object().shape({
    password: yup.string().min(6).max(40) // prettier-ignore
  });

  const password = req.body.password;

  try {
    await signupSchema.validate({ password }, { abortEarly: false });
  } catch (e) {
    return res.json(formatErrorMessage(e));
  }

  const userId = await redis.get(uuid);

  if (userId) {
    const user = await User.findById(userId);
    user.password = password;
    user.save();
    await redis.del(uuid);
    return res.send("New password generated");
  } else {
    return res.send(
      "Invalid or expired password reset token. Generate a new one."
    );
  }
};
