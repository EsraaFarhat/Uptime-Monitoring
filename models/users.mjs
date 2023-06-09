import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
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

userSchema.index({ email: 1 }, { unique: true });

const UserEntity = mongoose.model("User", userSchema);
UserEntity.ensureIndexes();

export default UserEntity;
