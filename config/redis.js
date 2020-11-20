//cache
const redis = require("redis");
const REDIS_PORT = process.env.PORT || 6379;

//redis settings
const client = redis.createClient(REDIS_PORT);
client.on("connect", () => {
  console.log("Connected to the redis");
});

module.exports = client;
