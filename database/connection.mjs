import mongoose from "mongoose";
import config from "../config/config.mjs";
import logger from "../shared/logger.mjs";

export const db = mongoose.createConnection(
  config.mongoose.url,
  config.mongoose.options
);

db.on("connecting", () => {
  logger.info("[MongoDB] connecting");
});

db.on("error", (err) => {
  logger.error(`[MongoDB] connection ${err}`);
  mongoose.disconnect();
});

db.on("connected", () => {
  logger.info("[MongoDB] connected");
});

db.once("open", async () => {
  logger.info("[MongoDB] connection opened");
});

db.on("reconnected", () => {
  logger.warn("[MongoDB] reconnected");
});

db.on("reconnectFailed", () => {
  logger.error("[MongoDB] reconnectFailed");
});

db.on("disconnected", () => {
  logger.warn("[MongoDB] disconnected");
});

db.on("fullsetup", () => {
  logger.debug("[MongoDB] reconnecting... %d");
});
