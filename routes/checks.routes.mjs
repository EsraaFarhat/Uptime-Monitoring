import { Router } from "express";
import asyncWrapper from "../shared/async-wrapper.mjs";
import ChecksController from "../controllers/checks.controller.mjs";
import authMiddleware from "../middlewares/auth.middleware.mjs";

const checksRoutes = Router();

checksRoutes.use(asyncWrapper(authMiddleware));

checksRoutes
  .route("/")
  .get(asyncWrapper(ChecksController.getChecks))
  .post(asyncWrapper(ChecksController.createCheck));

checksRoutes
  .route("/:id")
  .get(asyncWrapper(ChecksController.getCheck))
  .put(asyncWrapper(ChecksController.updateCheck))
  .delete(asyncWrapper(ChecksController.deleteCheck));

export default checksRoutes;
