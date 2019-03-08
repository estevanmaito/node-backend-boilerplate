const redis = require("../utils/redis")();
const uuid = require("uuid/v4");

exports.createToken = async userId => {
  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  const token = uuid();
  await redis.set(token, userId, "ex", ONE_DAY_IN_SECONDS);
  return token;
};
