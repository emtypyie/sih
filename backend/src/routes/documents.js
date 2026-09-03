import { Router } from "express";
import axios from "axios";
import { resolve } from "path";
import { Document } from "../models/Document.js";
import { Patient } from "../models/Patient.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const router = Router();
router.use(authenticate);

router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const patientId = req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, error: "patientId is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    const doc = await Document.create({
      patientId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      originalPath: req.file.path,
      status: "unverified",
    });

    logger.info(`Document saved: ${doc.originalName} for patient ${patientId}`);

    let ocrResult = null;

    try {
      const ocrBase = env.OCR_SERVICE_URL || "http://localhost:3001";
      const formData = new FormData();
      formData.append("document", new Blob([require("fs").readFileSync(req.file.path)]), req.file.originalname);
      formData.append("patientId", patientId);

      const ocrRes = await axios.post(`${ocrBase}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
      });

      if (ocrRes.data?.success && ocrRes.data?.ocr) {
        ocrResult = ocrRes.data.ocr;
        doc.rawOcrText = ocrResult.rawText || "";
        doc.structuredDx = ocrResult.dx || "";
        doc.structuredRx = ocrResult.rx || "";
        doc.structuredLabs = ocrResult.labs || "";
        doc.structuredSx = ocrResult.sx || "";
        doc.status = "unverified";
        await doc.save();

        await Patient.findByIdAndUpdate(patientId, {
          ocr: {
            dx: ocrResult.dx || "",
            rx: ocrResult.rx || "",
            labs: ocrResult.labs || "",
            sx: ocrResult.sx || "",
          },
        });
      }
    } catch (ocrErr) {
      logger.warn("OCR service unavailable, document saved without OCR:", ocrErr.message);
    }

    res.json({
      success: true,
      document: {
        _id: doc._id,
        originalName: doc.originalName,
        status: doc.status,
      },
      ocr: ocrResult,
      ocrDeployed: !!ocrResult,
    });
  } catch (err) {
    logger.error("Document upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

router.get("/:patientId/documents", async (req, res) => {
  try {
    const docs = await Document.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch documents" });
  }
});

export default router;
