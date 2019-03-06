const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  confirmed: { type: Boolean, default: false }
});

UserSchema.pre("save", function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // hash the password using the salt
  bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
    if (err) return next(err);

    // override the cleartext password with the hashed one
    user.password = hash;
    return next();
  });
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
