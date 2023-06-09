import mongoose from "mongoose";

const checkSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    protocol: { type: String, enum: ["HTTP", "HTTPS", "TCP"], required: true },
    path: { type: String },
    port: { type: Number },
    webhook: { type: String },
    timeout: { type: Number, default: 5 },
    interval: { type: Number, default: 10 },
    threshold: { type: Number, default: 1 },
    authentication: {
      username: { type: String },
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
    tags: [{ type: String }],
    ignoreSSL: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const CheckEntity = mongoose.model("Check", checkSchema);

export default CheckEntity;
