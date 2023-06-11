import { Router } from "express";
import asyncWrapper from "../shared/async-wrapper.mjs";
import ChecksController from "../controllers/checks.controller.mjs";
import authMiddleware from "../middlewares/auth.middleware.mjs";

const checksRoutes = Router();

checksRoutes.use(asyncWrapper(authMiddleware));

checksRoutes
  .route("/")
  // Route to create a new check
  .post(asyncWrapper(ChecksController.createCheck))
  // Route to get all checks for the current user
  .get(asyncWrapper(ChecksController.getChecks));

checksRoutes
  .route("/:id")
  // Route to get check by ID
  .get(asyncWrapper(ChecksController.getCheck))
  // Route to update check by ID
  .put(asyncWrapper(ChecksController.updateCheck))
  // Route to delete check by ID
  .delete(asyncWrapper(ChecksController.deleteCheck));

// Route to start monitoring a check by ID
checksRoutes.post("/:id/start", asyncWrapper(ChecksController.startMonitoring));
// Route to stop monitoring a check by ID
checksRoutes.post("/:id/stop", asyncWrapper(ChecksController.stopMonitoring));

export default checksRoutes;
