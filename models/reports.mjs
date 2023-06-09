import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  checkId: { type: Schema.Types.ObjectId, ref: "Check", required: true },
  status: { type: String, enum: ["up", "down"], required: true },
  availability: { type: Number, required: true },
  outages: { type: Number, required: true },
  downtime: { type: Number, required: true },
  uptime: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      status: { type: String, enum: ["success", "failure"] },
      responseTime: { type: Number },
      error: { type: String },
    },
  ],
});

const reportEntity = mongoose.model("Report", reportSchema);

export default reportEntity;
