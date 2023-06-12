import mongoose from "mongoose";
import redis from "redis";
import config from "../config/config.mjs";
import logger from "../shared/logger.mjs";

// Connect to MongoDB
export const db = mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("[MongoDB] connected");
  })
  .catch((err) => {
    logger.error(`[MongoDB] Failed to connect: ${err}`);
  });

// Connect to Redis
export const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});

(async function execute() {
  await client.connect();
})();

client.on("connect", () => {
  logger.info("[Redis] connected");
});
client.on("error", (err) => {
  logger.error("[Redis] Error connecting to Redis:", err);
});
