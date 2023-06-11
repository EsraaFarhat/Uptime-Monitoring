import _ from "lodash";
import cron from "node-cron";

import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "../shared/app-error.mjs";
import ReportsService from "../services/reports.service.mjs";
import MESSAGES from "../shared/messages.mjs";
import { validateObjectId, handlePaginationSort } from "../utils/helpers.mjs";

export default class ReportsController {
  // Function to get all reports for the current user
  static async getReports(req, res) {
    try {
      const { skip, limit, sort } = handlePaginationSort(req.query);
      const { tag } = req.query;

      const aggregate = [
        { $match: { checkId: { $ne: null } } },
        {
          $lookup: {
            from: "checks",
            localField: "checkId",
            foreignField: "_id",
            as: "checkId",
            pipeline: [{ $project: { url: 1, userId: 1, tags: 1 } }],
          },
        },
        { $unwind: "$checkId" },
        tag
          ? { $match: { "checkId.userId": req.user._id, "checkId.tags": tag } }
          : { $match: { "checkId.userId": req.user._id } },
        { $sort: sort },
        {
          $facet: {
            rows: [{ $skip: skip }, { $limit: limit }],
            count: [{ $count: "total" }],
          },
        },
      ];

      let reports = await ReportsService.getReportsAggregate(aggregate);

      let count;
      if (reports.length != 0) {
        count = reports[0].count[0] ? reports[0].count[0].total : 0;
        return res.send({ statusCode: 200, reports: reports[0].rows, count });
      }

      res.send({ statusCode: 200, reports: [], count: 0 });
    } catch (error) {
      throw new AppError(error);
    }
  }

  // Function to get report by ID
  static async getReport(req, res) {
    try {
      const { id } = req.params;
      let response = validateObjectId(id);
      if (response.error) {
        throw new BadRequestError(MESSAGES.INVALID_REPORT_ID);
      }

      const filters = { _id: id };
      const options = {
        populate: {
          path: "checkId",
          select: "url",
        },
      };

      let report = await ReportsService.getReport(filters, null, options);
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
