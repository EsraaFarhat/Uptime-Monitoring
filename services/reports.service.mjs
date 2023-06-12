import ReportsEntity from "../models/reports.model.mjs";

export default class ReportsService {
  static async getReport(filters, projection, options) {
    const report = await ReportsEntity.findOne(filters, projection, options);
    return report;
  }

  static async getReports(filters, projection, options) {
    const reports = await ReportsEntity.find(filters, projection, options);
    return reports;
  }

  static async addReport(body) {
    let addedReport = new ReportsEntity(body);
    addedReport = addedReport.save();

    return addedReport;
  }

  static async updateReport(filters, body) {
    const updatedReport = await ReportsEntity.findOneAndUpdate(filters, body, {
      new: true,
    });
    return updatedReport;
  }

  static async count(filters) {
    const count = await ReportsEntity.count(filters);
    return count;
  }

  static async deleteReport(filters) {
    const report = await ReportsEntity.findOne(filters);
    if (report) {
      await report.deleteOne();
    }
    return report;
  }

  static async getReportsAggregate(aggregate) {
    const reports = await ReportsEntity.aggregate(aggregate);
    return reports;
  }
}
