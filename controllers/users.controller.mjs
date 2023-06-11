import jwt from "jsonwebtoken";
import _ from "lodash";

import config from "../config/config.mjs";
import UsersService from "../services/users.service.mjs";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
} from "../shared/app-error.mjs";
import MESSAGES from "../shared/messages.mjs";
import { sendEmail } from "../utils/sendEmail.mjs";

const jwtSecret = config.privateKey;
export default class UsersController {
  // Function to signup and send email for verification
  static async signUp(req, res) {
    try {
      const { error } = UsersService.createUserSchema(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      req.body.email = req.body.email.toLowerCase();
      // Check if there is another user with the same email
      let userExist = await UsersService.getUser(
        {
          email: req.body.email,
        },
        ["_id"]
      );
      if (userExist) {
        throw new BadRequestError(MESSAGES.EMAIL_UNIQUE);
      }
      const user = await UsersService.addUser(req.body);

      const token = jwt.sign({ userId: user._id }, jwtSecret);

      const mailSubject = "Verify your email address for uptime monitoring";
      const mailBody = `Hello ${user.username}, <br><br> 
        Thank you for registering for uptime monitoring. <br><br>
        To complete the sign-up process, you need to verify your email address by clicking on the link below: <br><br>
        <a href= ${req.protocol}://${req.get(
        "host"
      )}/api/users/verifyAccount/${token}> Verify Account </a>`;
      sendEmail(user.email, mailSubject, mailBody);

      res.status(201).send({
        statusCode: 201,
        message: MESSAGES.EMAIL_VERIFICATION_SENT,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  // Function to verify account
  static async verifyAccount(req, res) {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, jwtSecret);
      const { userId } = decoded;

      await UsersService.updateUser({ _id: userId }, { isVerified: true });

      res.send({
        statusCode: 200,
        message: MESSAGES.EMAIL_VERIFIED,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN);
      }
      throw new AppError(error);
    }
  }

  // Function to login
  static async login(req, res) {
    try {
      const { error } = UsersService.userLoginSchema(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      req.body.email = req.body.email.toLowerCase();
      let user = await UsersService.getUser({
        email: req.body.email,
      });
      if (!user || !(await user.comparePassword(req.body.password))) {
        throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS);
      }

      if (!user.isVerified) {
        throw new UnauthorizedError(MESSAGES.EMAIL_NOT_VERIFIED);
      }

      // Generate and sign the JWT token that expires in one day
      const token = jwt.sign({ userId: user._id }, jwtSecret, {
        expiresIn: "1d",
      });

      res.send({
        user:
          typeof user._id === "object"
            ? _.omit(user.toObject(), ["password"])
            : _.omit(user, ["password"]),
        token,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }
}
