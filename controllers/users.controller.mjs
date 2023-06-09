import jwt from "jsonwebtoken";

import config from "../config/config.mjs";
import UsersProvider from "../services/users.service.mjs";
import { AppError, BadRequestError } from "../shared/app-error.mjs";
import MESSAGES from "../shared/messages.mjs";
import { sendEmail } from "../utils/sendEmail.mjs";

export default class UsersController {
  static async signUp(req, res) {
    try {
      const { error } = UsersProvider.createUserSchema(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      req.body.email = req.body.email.toLowerCase();
      // Check if there is another user with the same email
      let userExist = await UsersProvider.getUser(
        {
          email: req.body.email,
        },
        ["_id"]
      );
      if (userExist) {
        throw new BadRequestError(MESSAGES.EMAIL_UNIQUE);
      }
      const user = await UsersProvider.addUser(req.body);

      const token = jwt.sign({ userId: user._id }, config.privateKey);

      const mailSubject = "Verify your email address for uptime monitoring";
      const mailBody = `Hello ${user.username}, <br><br> 
        Thank you for registering for uptime monitoring. <br><br>
        To complete the sign-up process, you need to verify your email address by clicking on the link below: <br><br>
        <a href= ${req.protocol}://${req.get(
        "host"
      )}/api/users/verifyAccount/${token}> Verify Account </a>`;
      sendEmail(user.email, mailSubject, mailBody);

      res.send({
        message: MESSAGES.EMAIL_VERIFICATION_SENT,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  static async verifyAccount(req, res) {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, config.privateKey);
      const { userId } = decoded;

      await UsersProvider.updateUser({ _id: userId }, { isVerified: true });

      res.send({
        message: MESSAGES.EMAIL_VERIFIED,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN);
      }
      throw new AppError(error);
    }
  }
}
