import { Router } from "express";
import asyncWrapper from "../shared/async-wrapper.mjs";
import ReportsController from "../controllers/reports.controller.mjs";
import authMiddleware from "../middlewares/auth.middleware.mjs";

const reportsRoutes = Router();

reportsRoutes.use(asyncWrapper(authMiddleware));

reportsRoutes
  .route("/")
  // Route to get all reports for the current user
  .get(asyncWrapper(ReportsController.getReports));

reportsRoutes
  .route("/:id")
  // Route to get report by ID
  .get(asyncWrapper(ReportsController.getReport));

export default reportsRoutes;
