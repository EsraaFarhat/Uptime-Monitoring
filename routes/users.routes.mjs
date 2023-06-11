import { Router } from "express";
import asyncWrapper from "../shared/async-wrapper.mjs";
import UsersController from "../controllers/users.controller.mjs";

const usersRoutes = Router();

// Route to signup
usersRoutes.route("/signup").post(asyncWrapper(UsersController.signUp));

// Route to verify account
usersRoutes.get(
  "/verifyAccount/:token",
  asyncWrapper(UsersController.verifyAccount)
);

// Route to login
usersRoutes.route("/login").post(asyncWrapper(UsersController.login));

export default usersRoutes;
