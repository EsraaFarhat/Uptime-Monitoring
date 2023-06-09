import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Joi from "joi";

/* eslint no-underscore-dangle: 0 */
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const envSchema = Joi.object()
  .keys({
    MONGODB_HOST: Joi.string().required(),
    MONGODB_NAME: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid("development", "stage", "production")
      .required(),
    PARAMETER_LIMIT: Joi.number().required(),
    PORT: Joi.number().required(),
    REQUEST_LIMIT: Joi.number().required(),
  })
  .unknown();

const { value: env, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env, { stripUnknown: true });

if (error) {
  throw new Error(`Configuration Validation Error: ${error.message}`);
}

const config = {
  env: env.NODE_ENV,
  mongoose: {
    options: {
      // Don't build indexes
      autoIndex: false,
      // Use IPv4, skip trying IPv6
      family: 4,
      // Maintain up to 10 socket connections
      maxPoolSize: 10,
      // Keep trying to send operations for 5 seconds
      serverSelectionTimeoutMS: 5000,
      // Close sockets after 45 seconds of inactivity
      socketTimeoutMS: 45000,
    },
    url: `${env.MONGODB_HOST}${env.MONGODB_NAME}?retryWrites=true&w=majority`,
  },
  port: env.PORT,
  router: {
    limit: {
      parameter: env.PARAMETER_LIMIT,
      request: env.REQUEST_LIMIT,
    },
  },
};

export default config;
