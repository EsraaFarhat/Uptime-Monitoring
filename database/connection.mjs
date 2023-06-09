import mongoose from "mongoose";
import config from "../config/config.mjs";
import logger from "../shared/logger.mjs";

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.info(`Failed to connect to MongoDB: ${err}`);
  });
