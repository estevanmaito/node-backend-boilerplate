const Redis = require("ioredis");

const redisConnect = () => {
  return new Redis(process.env.REDIS_PORT, process.env.REDIS_DB);
};

module.exports = redisConnect;
