import axios from "axios";
import nodemailer from "nodemailer";
import push from "pushover-notifications";

import config from "../config/config.mjs";
import logger from "../shared/logger.mjs";

export const notifyUser = async (methods) => {
  if (methods.mail) {
    const { to, title, subject } = methods.mail;
    sendEmail(to, title, subject);
  }
  if (methods.webhook) {
    const { webhookUrl, message } = methods.webhook;
    await sendNotificationWithWebhook(webhookUrl, message);
  }
  if (methods.pushover) {
    const { title, message } = methods.pushover;
    await sendPushOverNotification(title, message);
  }
};

export const sendNotificationWithWebhook = async (webhookUrl, message) => {
  try {
    const payload = {
      message,
    };
    const response = await axios.post(webhookUrl, payload);
    logger.info(response.data);
  } catch (error) {
    logger.error(error.message);
  }
};

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

export const sendPushOverNotification = async (title, content) => {
  const pushover = new push({
    user: config.pushover.user,
    token: config.pushover.token,
  });

  const message = {
    message: content,
    title,
  };

  pushover.send(message, (err, result) => {
    if (err) {
      logger.error(err);
    } else {
      logger.log(result);
    }
  });
};
