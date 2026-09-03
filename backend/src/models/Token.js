import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  tokenNumber: { type: String, required: true },
  counter: { type: String, default: "" },
  priority: { type: Number, default: 3, enum: [1, 2, 3] },
  status: { type: String, default: "waiting", enum: ["waiting", "called", "completed"] },
  calledAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

tokenSchema.index({ status: 1, counter: 1 });
tokenSchema.index({ patientId: 1 });

export const Token = mongoose.model("Token", tokenSchema);
