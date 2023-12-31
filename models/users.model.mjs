import mongoose from "mongoose";
import bcrypt from "bcrypt";
import ChecksEntity from "./checks.model.mjs";

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.pre("deleteOne", { document: true }, async function (next) {
  await ChecksEntity.deleteMany({ userId: this._id }).exec();

  next();
});

const UsersEntity = mongoose.model("User", userSchema);

export default UsersEntity;
