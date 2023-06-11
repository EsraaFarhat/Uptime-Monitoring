import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import MESSAGES from "../shared/messages.mjs";
import UsersService from "../services/users.service.mjs";
import app from "../app.mjs";
import config from "../config/config.mjs";
import mongoose from "mongoose";

describe("UsersController", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("signUp", () => {
    it("should create a new user and send a verification email", async () => {
      const mockUser = {
        username: "testUser",
        email: "testUser@example.com",
        password: "Test@1234",
      };

      jest.spyOn(UsersService, "addUser").mockResolvedValue(mockUser);
      jest.spyOn(UsersService, "getUser").mockResolvedValue(null);

      const res = await request(app).post("/api/users/signup").send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe(MESSAGES.EMAIL_VERIFICATION_SENT);
    });

    it("should throw an error if email already exists", async () => {
      const mockUser = {
        username: "testUser",
        email: "testUser@example.com",
        password: "Test@1234",
      };

      jest.spyOn(UsersService, "getUser").mockResolvedValue(mockUser);

      const res = await request(app).post("/api/users/signup").send(mockUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.EMAIL_UNIQUE);
    });
  });

  describe("verifyAccount", () => {
    it("should verify the user account", async () => {
      const userId = "1234";
      const token = jwt.sign({ userId }, config.privateKey);

      jest.spyOn(jwt, "verify").mockReturnValue({ userId });
      jest.spyOn(UsersService, "updateUser").mockResolvedValue(true);

      const res = await request(app).get(`/api/users/verifyAccount/${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.EMAIL_VERIFIED);
    });

    it("should throw an error if the token is invalid", async () => {
      const invalidToken = "invalidToken";

      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new jwt.JsonWebTokenError(MESSAGES.INVALID_VERIFICATION_TOKEN);
      });

      const res = await request(app).get(
        `/api/users/verifyAccount/${invalidToken}`
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(MESSAGES.INVALID_VERIFICATION_TOKEN);
    });
  });

  describe("login", () => {
    it("should log in the user", async () => {
      const mockUser = {
        _id: "1234",
        username: "testUser",
        email: "testUser@example.com",
        password: "Test@1234",
        comparePassword: jest.fn().mockReturnValue(true),
        isVerified: true,
      };

      jest.spyOn(UsersService, "getUser").mockResolvedValue(mockUser);

      const res = await request(app).post("/api/users/login").send({
        email: "testUser@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("token");
    });

    it("should throw an error if the credentials are invalid", async () => {
      const mockUser = {
        _id: "1234",
        username: "testUser",
        email: "testUser@example.com",
        password: "Test@1234",
        comparePassword: jest.fn().mockReturnValue(false),
      };

      jest.spyOn(UsersService, "getUser").mockResolvedValue(mockUser);

      const res = await request(app).post("/api/users/login").send({
        email: "testUser@example.com",
        password: "InvalidPassword@123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(MESSAGES.INVALID_CREDENTIALS);
    });

    it("should throw an error if the account is not verified", async () => {
      const mockUser = {
        _id: "1234",
        username: "testUser",
        email: "testUser@example.com",
        password: "Test@1234",
        comparePassword: jest.fn().mockReturnValue(true),
        isVerified: false,
      };

      jest.spyOn(UsersService, "getUser").mockResolvedValue(mockUser);

      const res = await request(app).post("/api/users/login").send({
        email: "testUser@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(MESSAGES.EMAIL_NOT_VERIFIED);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
