import morgan from "morgan";

import logger from "../shared/logger.mjs";

// message will be passed to morgan by the error middleware using res.locals property
morgan.token("message", (req, res) =>
  res.locals.errorMessage ? JSON.stringify(res.locals.errorMessage) : ""
);

const successResponseFormat = `[:date[web]] :remote-addr - :method :url :status - :response-time ms`;
const errorResponseFormat = `[:date[web]] :remote-addr - :method :url :status - :response-time ms - message: :message`;

const morganSuccessHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(JSON.stringify(message)) },
});

const morganErrorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(JSON.stringify(message)) },
});

export { morganSuccessHandler, morganErrorHandler };
