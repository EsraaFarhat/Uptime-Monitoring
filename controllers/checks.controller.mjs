import _ from "lodash";
import cron from "node-cron";

import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "../shared/app-error.mjs";
import ChecksService from "../services/checks.service.mjs";
import ReportsService from "../services/reports.service.mjs";
import MESSAGES from "../shared/messages.mjs";
import { validateObjectId, handlePaginationSort } from "../utils/helpers.mjs";
import { client } from "../database/connection.mjs";
import { monitoringJobs } from "../utils/cronJobs.mjs";

export default class ChecksController {
  // Function to create a new check
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

  // Function to get all checks for the current user
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

  // Function to get check by ID
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
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      res.send({
        statusCode: 200,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  // Function to update check by ID
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

  // Function to delete check by ID
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

  // Function to start monitoring a specific check
  static async startMonitoring(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const filters = { _id: id, userId: req.user._id };

      const options = {
        populate: [
          {
            path: "userId",
            select: ["email"],
          },
        ],
      };
      let check = await ChecksService.getCheck(filters, null, options);
      if (!check) {
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      // Check if there is already a cron job running for this check
      if (monitoringJobs.has(id)) {
        throw new BadRequestError(MESSAGES.CHECK_MONITORED);
      }

      // Start the cron job
      let job = cron.schedule(`*/${check.interval} * * * *`, async function () {
        await ChecksService.checkURL(check);
      });

      // Add the job to the monitoringJobs so we can stop it later
      monitoringJobs.set(id, job);
      // Add the check to redis so we can start its cron job again if the server stopped
      await client.hSet(`job:${id}`, "checkId", id);

      res.send({
        statusCode: 200,
        message: MESSAGES.MONITORING_STARTED,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  // Function to stop monitoring a specific check
  static async stopMonitoring(req, res) {
    try {
      const { id } = req.params;

      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const filters = { _id: id, userId: req.user._id };

      let check = await ChecksService.getCheck(filters, ["_id"]);
      if (!check) {
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      // Get the running job
      let job = monitoringJobs.get(id);
      if (!job) {
        throw new BadRequestError(MESSAGES.CHECK_NOT_MONITORED);
      }

      // Stop the job
      job.stop();
      // Delete the job from the monitoringJobs
      monitoringJobs.delete(id);
      // Delete the job from redis
      await client.del(`job:${id}`);

      res.send({
        statusCode: 200,
        message: MESSAGES.MONITORING_STOPPED,
        check,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }

  // Function to get report for a check by ID
  static async getCheckReport(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_CHECK_ID);
      }

      const filters = { _id: id, userId: req.user._id };

      let check = await ChecksService.getCheck(filters, ["_id"]);
      if (!check) {
        throw new NotFoundError(MESSAGES.CHECK_NOT_FOUND);
      }

      let report = await ReportsService.getReport({ checkId: id });
      if (!report) {
        throw new NotFoundError(MESSAGES.REPORT_NOT_FOUND);
      }

      res.send({
        statusCode: 200,
        report,
      });
    } catch (error) {
      throw new AppError(error);
    }
  }
}
