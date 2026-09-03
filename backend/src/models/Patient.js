import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  abha: { type: String, default: null },
  phone: { type: String, default: null },
  name: { type: String, default: "" },
  age: { type: Number, default: 0 },
  gender: { type: String, default: "Male", enum: ["Male", "Female", "Other"] },
  stream: { type: String, default: "allopathy", enum: ["allopathy", "ayush"] },
  chiefComplaint: { type: String, default: "" },
  vitals: {
    bp: { type: String, default: "" },
    sugar: { type: String, default: "" },
    pulse: { type: String, default: "" },
  },
  allergies: [{ type: String }],
  diet: { type: String, default: "" },
  sleep: { type: String, default: "" },
  ros: [{ type: String }],
  family: [{ type: String }],
  ayush: {
    prakriti: { type: String, default: "" },
    agni: { type: String, default: "" },
    koshtha: { type: String, default: "" },
    vikriti: { type: String, default: "" },
  },
  ocr: {
    dx: { type: String, default: "" },
    rx: { type: String, default: "" },
    labs: { type: String, default: "" },
    sx: { type: String, default: "" },
  },
  interviewAnswers: [{
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    isRed: { type: Boolean, default: false },
  }],
  isRedFlag: { type: Boolean, default: false },
  triagePriority: { type: Number, default: 3 },
  status: { type: String, default: "in_progress" },
  isGuest: { type: Boolean, default: false },
  userRole: { type: String, default: "self" },
}, { timestamps: true });

patientSchema.index({ abha: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ status: 1 });

export const Patient = mongoose.model("Patient", patientSchema);
