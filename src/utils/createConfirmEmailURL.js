const uuid = require("uuid/v4");

module.exports.createConfirmEmailURL = async (url, userId, redis) => {
  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  const id = uuid();
  await redis.set(id, userId, "ex", ONE_DAY_IN_SECONDS);
  return `${url}/confirm/${id}`;
};
