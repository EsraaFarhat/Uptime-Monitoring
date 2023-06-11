import request from "supertest";
import { jest } from "@jest/globals";
import MESSAGES from "../shared/messages.mjs";
import ChecksService from "../services/checks.service.mjs";
import ReportsService from "../services/reports.service.mjs";
import app from "../app.mjs";

describe("ChecksController", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "esraafarhat97@gmail.com",
      password: "Aa123@",
    });

    expect(res.status).toBe(200);
    token = res.body.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createCheck", () => {
    it("should throw an error if the schema validation fails", async () => {
      const mockCheck = {
        url: "www.example.com",
        protocol: "HTTPS",
        path: "/",
      };

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(mockCheck);

      const res = await request(app)
        .post("/api/checks")
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
    });

    it("should create a new check ", async () => {
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "addCheck").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .post("/api/checks")
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe(MESSAGES.CHECK_ADDED_SUCCESSFULLY);
    });
  });

  describe("getChecks", () => {
    it("should get the last 20 (default) checks for the current user", async () => {
      jest.spyOn(ChecksService, "getChecks").mockResolvedValue(null);

      const res = await request(app)
        .get("/api/checks")
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("checks");
      expect(res.body).toHaveProperty("count");
    });
  });

  describe("getCheck", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should return the check", async () => {
      const checkId = "6483d49d026bd9ff90504904";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(checkId);

      const res = await request(app)
        .get(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("check");
    });
  });

  describe("updateCheck", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "updateCheck").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/checks/${checkId}`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "updateCheck").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/checks/${checkId}`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should throw an error if the schema validation fails", async () => {
      const checkId = "6483d49d026bd9ff90504905";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "WRONG_VALUE",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "updateCheck").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(mockCheck);

      const res = await request(app)
        .put(`/api/checks/${checkId}`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
    });

    it("should update check by id ", async () => {
      const checkId = "6483d49d026bd9ff90504905";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "updateCheck").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(mockCheck);

      const res = await request(app)
        .put(`/api/checks/${checkId}`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.CHECK_EDITED_SUCCESSFULLY);
      expect(res.body).toHaveProperty("check");
    });
  });

  describe("deleteCheck", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";

      jest.spyOn(ChecksService, "deleteCheck").mockResolvedValue(null);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "deleteCheck").mockResolvedValue(null);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should delete check by id ", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "deleteCheck").mockResolvedValue(null);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(checkId);

      const res = await request(app)
        .delete(`/api/checks/${checkId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.CHECK_DELETED_SUCCESSFULLY);
      expect(res.body).toHaveProperty("check");
    });
  });

  describe("startMonitoring", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "checkURL").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/checks/${checkId}/start`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "checkURL").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/checks/${checkId}/start`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should start monitoring the check ", async () => {
      const checkId = "6483d49d026bd9ff90504905";
      const mockCheck = {
        name: "My Website",
        url: "www.facebook.com",
        protocol: "HTTPS",
        path: "/",
        port: 443,
        webhook: "https://webhook.example.com",
        timeout: 5000,
        interval: 1,
        tags: ["website", "test"],
      };

      jest.spyOn(ChecksService, "checkURL").mockResolvedValue(mockCheck);
      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(mockCheck);

      const res = await request(app)
        .post(`/api/checks/${checkId}/start`)
        .send(mockCheck)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.MONITORING_STARTED);
      expect(res.body).toHaveProperty("check");
    });
  });

  describe("stopMonitoring", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/checks/${checkId}/stop`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/checks/${checkId}/stop`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should stop monitoring the check ", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(checkId);

      const res = await request(app)
        .post(`/api/checks/${checkId}/stop`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.MONITORING_STOPPED);
      expect(res.body).toHaveProperty("check");
    });
  });

  describe("getCheckReport", () => {
    it("should throw an error if the id is invalid", async () => {
      const checkId = "1234";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);
      jest.spyOn(ReportsService, "getReport").mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/checks/${checkId}/report`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_CHECK_ID);
    });

    it("should throw an error if the check not found", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(null);
      jest.spyOn(ReportsService, "getReport").mockResolvedValue(checkId);

      const res = await request(app)
        .get(`/api/checks/${checkId}/report`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.CHECK_NOT_FOUND);
    });

    it("should get the check's report", async () => {
      const checkId = "6483d49d026bd9ff90504905";

      jest.spyOn(ChecksService, "getCheck").mockResolvedValue(checkId);
      jest.spyOn(ReportsService, "getReport").mockResolvedValue(checkId);

      const res = await request(app)
        .get(`/api/checks/${checkId}/report`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("report");
    });
  });
});
