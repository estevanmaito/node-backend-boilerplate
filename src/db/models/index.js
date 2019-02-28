const mongoose = require("mongoose");
const User = require("./User");

const startDB = ({ db }) =>
  mongoose.connect(`mongodb://mongodb:27017/${db}`, { useNewUrlParser: true });

const models = {
  User
};

module.exports = { startDB, models };
