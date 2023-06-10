import _ from "lodash";

import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "../shared/app-error.mjs";
import ChecksService from "../services/check.service.mjs";
import MESSAGES from "../shared/messages.mjs";
import { validateObjectId, handlePaginationSort } from "../utils/helpers.mjs";

export default class ChecksController {
  static async createCheck(req, res) {
    try {
      const { error } = ChecksService.createCheckSchema(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      req.body.userId = req.user._id;

      let check = await ChecksService.addCheck(req.body);

      res.status(201).send({
        statusCode: 201,
        message: MESSAGES.CHECK_ADDED_SUCCESSFULLY,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  static async getChecks(req, res) {
    try {
      const { skip, limit, sort } = handlePaginationSort(req.query);
      const filters = { userId: req.user._id };

      const options = {
        skip,   
        limit,
        sort,
      };

      const checks = await ChecksService.getChecks(filters, null, options);
      const count = await ChecksService.count(filters);

      res.send({
        statusCode: 200,
        checks,
        count,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  static async getCheck(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const filters = { _id: id, userId: req.user._id };

      let check = await ChecksService.getCheck(filters);
      if (!check) {
        throw new BadRequestError(MESSAGES.CHECK_NOT_FOUND);
      }

      res.send({
        statusCode: 200,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  static async updateCheck(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const { error } = ChecksService.updateCheckSchema(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      const filters = { _id: id, userId: req.user._id };

      const check = await ChecksService.getCheck(filters, ["_id"]);
      if (!check) {
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      let updatedCheck = await ChecksService.updateCheck(filters, req.body);

      res.send({
        statusCode: 200,
        message: MESSAGES.CHECK_EDITED_SUCCESSFULLY,
        check: updatedCheck,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  static async deleteCheck(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const filters = { _id: id, userId: req.user._id };

      let check = await ChecksService.getCheck(filters);
      if (!check) {
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      check = await ChecksService.deleteCheck(filters);

      res.send({
        statusCode: 200,
        message: MESSAGES.CHECK_DELETED_SUCCESSFULLY,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }
}
