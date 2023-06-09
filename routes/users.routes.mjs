import { Router } from "express";
import asyncWrapper from "../shared/async-wrapper.mjs";
import UsersController from "../controllers/users.controller.mjs";

const usersRoutes = Router();

usersRoutes.route("/signup").post(asyncWrapper(UsersController.signUp));

usersRoutes.patch(
  "/verifyAccount/:token",
  asyncWrapper(UsersController.activateAccount)
);

usersRoutes.route("/login").post(asyncWrapper(UsersController.login));

export default usersRoutes;
