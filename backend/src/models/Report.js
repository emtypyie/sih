import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, unique: true },
  summary: { type: String, default: "" },
  structuredReport: { type: mongoose.Schema.Types.Mixed, default: {} },
  fhirBundle: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

reportSchema.index({ patientId: 1 });

export const Report = mongoose.model("Report", reportSchema);
