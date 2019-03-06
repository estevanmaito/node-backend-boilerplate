const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const userController = require("./controllers/user");

mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DB}`, {
  useNewUrlParser: true
});

app.use(express.json());

// routes
app.post("/signup", userController.postSignup);
app.get("/confirm/:id", userController.getConfirmEmail);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
