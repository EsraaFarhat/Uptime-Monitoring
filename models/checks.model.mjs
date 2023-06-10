import mongoose from "mongoose";

const checkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, required: true },
    url: { type: String, trim: true, required: true },
    protocol: {
      type: String,
      trim: true,
      enum: ["HTTP", "HTTPS", "TCP"],
      required: true,
    },
    path: { type: String, trim: true },
    port: { type: Number },
    webhook: { type: String, trim: true },
    timeout: { type: Number, default: 5 },
    interval: { type: Number, default: 10 },
    threshold: { type: Number, default: 1 },
    authentication: {
      username: { type: String, trim: true },
      password: { type: String },
    },
    httpHeaders: [
      {
        key: String,
        value: String,
      },
    ],
    assert: {
      statusCode: { type: Number },
    },
    tags: [{ type: String, trim: true }],
    ignoreSSL: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ChecksEntity = mongoose.model("Check", checkSchema);

export default ChecksEntity;
