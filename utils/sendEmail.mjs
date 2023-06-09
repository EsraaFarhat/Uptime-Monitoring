import nodemailer from "nodemailer";
import config from "../config/config.mjs";
import logger from "../shared/logger.mjs";

export function sendEmail(userEmails, subject, content, attachments) {
  const mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.emailFrom,
      pass: config.email.emailPassword,
    },
  });
  let mailOptions = {
    from: config.email.emailFrom,
    to: userEmails,
    subject: subject,
    html: `<html>${content}</html>`,
    attachments,
  };

  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error(error);
    } else {
      logger.info(info.response);
    }
  });
}
