import jwt from "jsonwebtoken";
import config from "../config/config.mjs";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
} from "../shared/app-error.mjs";
import MESSAGES from "../shared/messages.mjs";
import UsersService from "../services/users.service.mjs";

const jwtSecret = config.privateKey;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError(MESSAGES.AUTHENTICATION_FAILED);
    }

    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await UsersService.getUserById(decodedToken.userId);

    // Attach the user object to the request for further use in subsequent middleware or routes
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new BadRequestError(MESSAGES.EXPIRED_TOKEN);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new BadRequestError(MESSAGES.INVALID_TOKEN);
    }
    throw new AppError(error);
  }
};

export default authMiddleware;
