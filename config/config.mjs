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
    EMAIL_FROM: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    PRIVATE_KEY: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    PUSHOVER_USER: Joi.string().required(),
    PUSHOVER_TOKEN: Joi.string().required(),
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
  email: {
    emailFrom: env.EMAIL_FROM,
    emailPassword: env.EMAIL_PASSWORD,
  },
  privateKey: env.PRIVATE_KEY,
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  pushover: {
    user: env.PUSHOVER_USER,
    token: env.PUSHOVER_TOKEN,
  },
};

export default config;
