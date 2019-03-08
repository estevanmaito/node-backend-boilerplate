const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const helmet = require("helmet");

const userController = require("./controllers/user");

mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DB}`, {
  useNewUrlParser: true
});

app.use(helmet());

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
app.use(
  session({
    name: "qid",
    store: new RedisStore({
      host: process.env.REDIS_DB,
      port: process.env.REDIS_PORT
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_WEEK
    }
  })
);

app.use(express.json());

// routes
app.post("/signup", userController.postSignup);
app.post("/confirmation/:id", userController.postConfirmationEmail);
app.post("/resend-confirmation", userController.postResendConfirmation);
app.post("/login", userController.postLogin);
app.post("/logout", userController.postLogout);
app.post("/forgot-password", userController.postForgotPassword);
app.post("/reset-password/:id", userController.postResetPassword);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
