import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, default: "" },
  originalPath: { type: String, default: "" },
  webpPath: { type: String, default: "" },
  rawOcrText: { type: String, default: "" },
  structuredDx: { type: String, default: "" },
  structuredRx: { type: String, default: "" },
  structuredLabs: { type: String, default: "" },
  structuredSx: { type: String, default: "" },
  status: { type: String, default: "processing", enum: ["processing", "unverified", "verified", "rejected"] },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  rejectionReason: { type: String, default: "" },
}, { timestamps: true });

documentSchema.index({ patientId: 1 });

export const Document = mongoose.model("Document", documentSchema);
