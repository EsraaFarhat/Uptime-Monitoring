import Joi from "joi";
import axios from "axios";
import https from "https";

import ReportsService from "../services/reports.service.mjs";
import ReportsEntity from "../models/reports.model.mjs";
import ChecksEntity from "../models/checks.model.mjs";
import { sendEmail } from "../utils/sendEmail.mjs";

export default class ChecksService {
  static async getCheck(filters, projection, options) {
    const check = await ChecksEntity.findOne(filters, projection, options);
    return check;
  }

  static async getChecks(filters, projection, options) {
    const checks = await ChecksEntity.find(filters, projection, options);
    return checks;
  }

  static async addCheck(body) {
    let addedCheck = new ChecksEntity(body);
    addedCheck = addedCheck.save();

    return addedCheck;
  }

  static async updateCheck(filters, body) {
    const updatedCheck = await ChecksEntity.findOneAndUpdate(filters, body, {
      new: true,
    });
    return updatedCheck;
  }

  static async count(filters) {
    const count = await ChecksEntity.count(filters);
    return count;
  }

  static async deleteCheck(filters) {
    const check = await ChecksEntity.findOneAndDelete(filters);
    return check;
  }

  static createCheckSchema = (check) => {
    const schema = Joi.object({
      name: Joi.string().trim().required(),
      url: Joi.string().trim().required(),
      protocol: Joi.string().trim().valid("HTTP", "HTTPS", "TCP").required(),
      path: Joi.string().trim(),
      port: Joi.number().min(0).max(65535),
      webhook: Joi.string().trim(),
      timeout: Joi.number(),
      interval: Joi.number(),
      threshold: Joi.number(),
      authentication: Joi.object({
        username: Joi.string().trim(),
        password: Joi.string(),
      }),
      httpHeaders: Joi.array().items({
        key: Joi.string(),
        value: Joi.string(),
      }),
      assert: Joi.object({
        statusCode: Joi.number(),
      }),
      tags: Joi.array().items(Joi.string()),
      ignoreSSL: Joi.boolean(),
    });

    return schema.validate(check);
  };

  static updateCheckSchema = (check) => {
    const schema = Joi.object({
      name: Joi.string().trim(),
      url: Joi.string().trim(),
      protocol: Joi.string().trim().valid("HTTP", "HTTPS", "TCP"),
      path: Joi.string().trim(),
      port: Joi.number().min(0).max(65535),
      webhook: Joi.string().trim(),
      timeout: Joi.number(),
      interval: Joi.number(),
      threshold: Joi.number(),
      authentication: Joi.object({
        username: Joi.string().trim(),
        password: Joi.string(),
      }),
      httpHeaders: Joi.array().items({
        key: Joi.string(),
        value: Joi.string(),
      }),
      assert: Joi.object({
        statusCode: Joi.number(),
      }),
      tags: Joi.array().items(Joi.string()),
      ignoreSSL: Joi.boolean(),
    });

    return schema.validate(check);
  };

  // Function to check if a URL is up or down and notify the check's owner with its status
  static checkURL = async (check) => {
    let url;
    if (check.port) {
      url = `${check.protocol.toLowerCase()}://${check.url}:${check.port}${
        check.path ? check.path : "/"
      }`;
    } else {
      url = `${check.protocol.toLowerCase()}://${check.url}${
        check.path ? check.path : "/"
      }`;
    }

    let httpHeadersObject = {};
    if (check.httpHeaders && check.httpHeaders.length) {
      check.httpHeaders.forEach((header) => {
        httpHeadersObject[header.key] = header.value;
      });
    }

    const options = {
      timeout: check.timeout * 1000,
      headers: httpHeadersObject,
      auth: check.authentication,
      validateStatus: function (status) {
        if (check.assert && check.assert.statusCode) {
          // only treat as a success if status code matches the one defined in the check
          return status === check.assert.statusCode;
        } else {
          // If no assert object is defined, treat any  2xx status code as a success
          return status >= 200 && status < 300;
        }
      },
      httpsAgent: new https.Agent({
        // if ignoreSSL is true, rejectUnauthorized will be false
        rejectUnauthorized: !check.ignoreSSL,
      }),
    };

    let start = Date.now();
    let report;
    try {
      await axios.get(url, options);

      // Get the report for this check
      report = await ReportsService.getReport({ checkId: check._id });
      // If the report not exist, create new one
      if (!report) {
        report = new ReportsEntity({ checkId: check._id });
      }

      if (!report.status || report.status === "DOWN") {
        // If the server was down and now is up, send an email
        sendEmail(
          check.userId.email,
          `Server ${check.url} is UP`,
          `Server ${check.url} is now UP.`
        );
      }
      report.status = "UP";
      report.uptime += (Date.now() - start) / 1000;
      report.history.push({
        status: "SUCCESS",
        responseTime: Date.now() - start,
        error: "",
      });
      report.availability =
        (report.uptime / (report.uptime + report.downtime)) * 100;
      const totalResponseTime = report.history.reduce(
        (acc, curr) => acc + curr.responseTime,
        0
      );
      report.responseTime = totalResponseTime / report.history.length;
      await report.save();
    } catch (err) {
      // Get the report for this check
      report = await ReportsService.getReport({ checkId: check._id });
      // If the report not exist, create new one
      if (!report) {
        report = new ReportsEntity({ checkId: check._id });
      }
      if (!report.status || report.status === "UP") {
        // If the server was up and now is down, send an email
        sendEmail(
          check.userId.email,
          `Server ${check.url} is DOWN`,
          `Server ${check.url} is now DOWN.`
        );
      }
      report.status = "DOWN";
      report.outages += 1;
      report.downtime += (Date.now() - start) / 1000; // Convert to seconds
      report.history.push({
        status: "FAILURE",
        responseTime: Date.now() - start,
        error: err.message,
      });
      report.availability =
        (report.uptime / (report.uptime + report.downtime)) * 100;
      const totalResponseTime = report.history.reduce(
        (acc, curr) => acc + curr.responseTime,
        0
      );
      report.responseTime = totalResponseTime / report.history.length;
      await report.save();
    }
  };
}
