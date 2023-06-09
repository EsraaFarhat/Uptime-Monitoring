import _ from "lodash";
import { InternalServerError, NotFoundError } from "../shared/app-error.mjs";

export default class AppErrorHandler {
  static handler(err, req, res, next) {
    const error = !err.isOperational
      ? new InternalServerError(undefined, err)
      : err;
    res.locals.errorMessage = err.message;
    const response = _.pick(error, ["statusCode", "message"]);
    response.message =
      typeof response.message === "object"
        ? response.message[req.lang] || JSON.stringify(response.message)
        : response.message;
    res.status(response.statusCode).send(response);
  }

  static notFound(req, res, next) {
    next(new NotFoundError());
  }
}
