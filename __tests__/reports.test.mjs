import request from "supertest";
import { jest } from "@jest/globals";
import MESSAGES from "../shared/messages.mjs";
import ReportsService from "../services/reports.service.mjs";
import app from "../app.mjs";

describe("ReportsController", () => {
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

  describe("getReports", () => {
    it("should get the last 20 (default) reports for the current user", async () => {
      jest.spyOn(ReportsService, "getReports").mockResolvedValue(null);

      const res = await request(app)
        .get("/api/reports")
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
      expect(res.body).toHaveProperty("count");
    });
  });

  describe("getReport", () => {
    it("should throw an error if the id is invalid", async () => {
      const reportId = "1234";

      jest.spyOn(ReportsService, "getReport").mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/reports/${reportId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MESSAGES.INVALID_REPORT_ID);
    });

    it("should throw an error if the report not found", async () => {
      const reportId = "6483d49d026bd9ff90504905";

      jest.spyOn(ReportsService, "getReport").mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/reports/${reportId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(MESSAGES.REPORT_NOT_FOUND);
    });

    it("should return the report", async () => {
      const reportId = "6483d49d026bd9ff90504904";

      jest.spyOn(ReportsService, "getReport").mockResolvedValue(reportId);

      const res = await request(app)
        .get(`/api/reports/${reportId}`)
        .send(null)
        .set("Authorization", "Bearer " + token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("report");
    });
  });

});
