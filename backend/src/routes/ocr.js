import { Router } from "express";
import { Patient } from "../models/Patient.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";
import { processOCR } from "../services/ocrService.js";
import { NotFoundError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const router = Router();
router.use(authenticate);

router.post("/upload", upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const patientId = req.body.patientId || req.patientId;
    const patient = Patient.findById(patientId);
    if (!patient) throw new NotFoundError("Patient");

    const result = await processOCR(req.file.path);
    Patient.findByIdAndUpdate(patientId, { ocr: result.parsed });
    Patient.findByIdAndUpdate(patientId, {
      documents: [...(patient.documents || []), { filename: req.file.filename, originalName: req.file.originalname, mimetype: req.file.mimetype }],
    });

    const io = req.app.get("io");
    if (io) io.emit("patient:update", { patientId, field: "ocrComplete", value: true });

    res.json({ success: true, ocr: result.parsed, rawText: result.rawText, document: { filename: req.file.filename, originalName: req.file.originalname } });
  } catch (err) { next(err); }
});

router.get("/:patientId/results", async (req, res, next) => {
  try {
    const patient = Patient.findById(req.params.patientId);
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, ocr: patient.ocr, documents: patient.documents });
  } catch (err) { next(err); }
});

export default router;
