const redis = require("redis");
const REDIS_PORT = process.env.PORT || 6379;

//REDIS SETTINGS FOR LOCAL APP
// const client = redis.createClient({
//   port: REDIS_PORT,
// });

//REDIS SETTINGS FOR DOCKER
const client = redis.createClient({
  host: "redis-server",
  port: 6379,
});
client.on("connect", () => {
  console.log("Connected to the redis");
});

module.exports = client;
