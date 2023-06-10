import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  checkId: { type: mongoose.Schema.Types.ObjectId, ref: "Check", required: true },
  status: { type: String, trim: true, enum: ["up", "down"], required: true },
  availability: { type: Number, required: true },
  outages: { type: Number, required: true },
  downtime: { type: Number, required: true },
  uptime: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      status: { type: String, trim: true, enum: ["success", "failure"] },
      responseTime: { type: Number },
      error: { type: String, trim: true },
    },
  ],
});

const ReportsEntity = mongoose.model("Report", reportSchema);

export default ReportsEntity;
