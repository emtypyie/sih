import { Router } from "express";
import { Patient } from "../models/Patient.js";
import { Report } from "../models/Report.js";
import { authenticate } from "../middleware/auth.js";
import { generateReport, getReport } from "../services/reportService.js";
import { generateFHIR } from "../services/fhirService.js";

const router = Router();
router.use(authenticate);

router.post("/generate/:patientId", async (req, res, next) => {
  try {
    const report = await generateReport(req.params.patientId);
    const io = req.app.get("io");
    if (io) io.emit("patient:update", { patientId: req.params.patientId, field: "reportReady", value: true });
    res.json({ success: true, report });
  } catch (err) { next(err); }
});

router.get("/:patientId", async (req, res, next) => {
  try {
    const report = await getReport(req.params.patientId);
    res.json({ success: true, report });
  } catch (err) { next(err); }
});

router.get("/:patientId/fhir", async (req, res, next) => {
  try {
    const bundle = await generateFHIR(req.params.patientId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="FHIR_R4_${req.params.patientId}.json"`);
    res.json(bundle);
  } catch (err) { next(err); }
});

router.get("/doctor/:patientId", async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    let report = null;
    try { report = await getReport(req.params.patientId); } catch { report = null; }
    res.json({ success: true, patient, report: report?.summary || null, structuredReport: report?.structuredReport || null });
  } catch (err) { next(err); }
});

export default router;
