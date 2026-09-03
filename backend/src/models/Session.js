import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

sessionSchema.index({ phone: 1, verified: 1 });

export const Session = mongoose.model("Session", sessionSchema);
