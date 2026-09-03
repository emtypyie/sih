import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Patient } from "../models/Patient.js";
import { Token } from "../models/Token.js";
import { Report } from "../models/Report.js";
import { Document } from "../models/Document.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const STAFF = [
  { id: "staff_001", username: "admin", password: "admin123", name: "Dr. Admin", role: "admin" },
  { id: "staff_002", username: "doctor", password: "doctor123", name: "Dr. Sharma", role: "doctor" },
];

function signStaffToken(staff) {
  return jwt.sign({ staffId: staff.id, role: staff.role, name: staff.name }, env.JWT_SECRET, { expiresIn: "12h" });
}

function authenticateDoctor(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "No token provided" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], env.JWT_SECRET);
    if (!decoded.staffId) return res.status(401).json({ success: false, error: "Invalid token" });
    req.staffId = decoded.staffId;
    req.staffRole = decoded.role;
    next();
  } catch { return res.status(401).json({ success: false, error: "Invalid or expired token" }); }
}

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, error: "Username and password required" });
  const staff = STAFF.find(s => s.username === username && s.password === password);
  if (!staff) return res.status(401).json({ success: false, error: "Invalid credentials" });
  res.json({ success: true, token: signStaffToken(staff), staff: { id: staff.id, name: staff.name, role: staff.role } });
});

router.get("/queue", authenticateDoctor, async (req, res) => {
  try {
    const queue = await Token.find({ status: { $in: ["waiting", "called"] } })
      .sort({ priority: 1, createdAt: 1 })
      .populate("patientId", "name abha chiefComplaint");
    res.json({ success: true, queue });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/token/:id/call", authenticateDoctor, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(req.params.id, { status: "called", calledAt: new Date() }, { new: true })
      .populate("patientId", "name abha chiefComplaint");
    if (!token) return res.status(404).json({ success: false, error: "Token not found" });
    res.json({ success: true, token });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/token/:id/complete", authenticateDoctor, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(req.params.id, { status: "completed", completedAt: new Date() }, { new: true })
      .populate("patientId", "name abha chiefComplaint");
    if (!token) return res.status(404).json({ success: false, error: "Token not found" });
    await Patient.findByIdAndUpdate(token.patientId._id, { status: "completed" });
    res.json({ success: true, token });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get("/patient/:id", authenticateDoctor, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get("/patient/:id/documents", authenticateDoctor, async (req, res) => {
  try {
    const docs = await Document.find({ patientId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get("/patient/:id/report", authenticateDoctor, async (req, res) => {
  try {
    const report = await Report.findOne({ patientId: req.params.id });
    res.json({ success: true, report: report || null });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/document/:id/verify", authenticateDoctor, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: "Document not found" });
    doc.status = "verified";
    doc.verifiedBy = req.staffId;
    doc.verifiedAt = new Date();
    await doc.save();
    if (doc.rawOcrText) {
      await Patient.findByIdAndUpdate(doc.patientId, {
        ocr: { dx: doc.structuredDx, rx: doc.structuredRx, labs: doc.structuredLabs, sx: doc.structuredSx }
      });
    }
    res.json({ success: true, document: doc });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/document/:id/reject", authenticateDoctor, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: "Document not found" });
    doc.status = "rejected";
    doc.verifiedBy = req.staffId;
    doc.verifiedAt = new Date();
    doc.rejectionReason = req.body.reason || "";
    await doc.save();
    res.json({ success: true, document: doc });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
