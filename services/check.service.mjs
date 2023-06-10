import Joi from "joi";
import ChecksEntity from "../models/checks.model.mjs";

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

  static checkSchema = Joi.object({
    name: Joi.string().trim().required(),
    url: Joi.string().trim().required(),
    protocol: Joi.string().trim().valid("HTTP", "HTTPS", "TCP").required(),
    path: Joi.string().trim(),
    port: Joi.number(),
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

  static createCheckSchema = (check) => {
    const schema = Joi.object({
      name: Joi.string().trim().required(),
      url: Joi.string().trim().required(),
      protocol: Joi.string().trim().valid("HTTP", "HTTPS", "TCP").required(),
      path: Joi.string().trim(),
      port: Joi.number(),
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
      port: Joi.number(),
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
}
