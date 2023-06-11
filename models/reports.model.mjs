import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  checkId: { type: mongoose.Schema.Types.ObjectId, ref: "Check", required: true },
  status: { type: String, trim: true, enum: ["UP", "DOWN"], required: true },
  availability: { type: Number, required: true },
  outages: { type: Number, default: 0 },
  downtime: { type: Number, default: 0 },
  uptime: { type: Number, default: 0 },
  responseTime: { type: Number, required: true },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      status: { type: String, trim: true, enum: ["SUCCESS", "FAILURE"] },
      responseTime: { type: Number },
      error: { type: String, trim: true },
    },
  ],
});

const ReportsEntity = mongoose.model("Report", reportSchema);

export default ReportsEntity;
