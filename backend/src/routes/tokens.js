import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient.js";
import { Token } from "../models/Token.js";
import { authenticate } from "../middleware/auth.js";
import { generateTokenNumber } from "../utils/helpers.js";

const router = Router();
router.use(authenticate);

router.post("/issue", async (req, res, next) => {
  try {
    const { patientId, counter, priority } = z.object({ patientId: z.string(), counter: z.string().optional(), priority: z.coerce.number().min(1).max(3).default(3) }).parse(req.body);
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });

    const tokenNumber = generateTokenNumber(priority);
    const token = await Token.create({ patientId, tokenNumber, counter: counter || "", priority });
    await Patient.findByIdAndUpdate(patientId, { status: "token_issued" });

    const io = req.app.get("io");
    if (io) io.emit("token:issued", { token: tokenNumber, patientId, patientName: patient.name, counter, priority });

    res.json({ success: true, token: { ...token.toObject(), patientName: patient.name } });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id).populate("patientId", "name abha chiefComplaint");
    if (!token) return res.status(404).json({ success: false, error: "Token not found" });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

router.get("/queue/:counter", async (req, res, next) => {
  try {
    const queue = await Token.find({ counter: req.params.counter, status: { $in: ["waiting", "called"] } })
      .sort({ priority: 1, createdAt: 1 })
      .populate("patientId", "name abha chiefComplaint");
    res.json({ success: true, queue });
  } catch (err) { next(err); }
});

router.put("/:id/call", async (req, res, next) => {
  try {
    const token = await Token.findByIdAndUpdate(req.params.id, { status: "called", calledAt: new Date() }, { new: true })
      .populate("patientId", "name abha chiefComplaint");
    if (!token) return res.status(404).json({ success: false, error: "Token not found" });
    const io = req.app.get("io");
    if (io) io.emit("token:called", { token: token.tokenNumber, counter: token.counter });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

router.put("/:id/complete", async (req, res, next) => {
  try {
    const token = await Token.findByIdAndUpdate(req.params.id, { status: "completed", completedAt: new Date() }, { new: true })
      .populate("patientId", "name abha chiefComplaint");
    if (!token) return res.status(404).json({ success: false, error: "Token not found" });
    await Patient.findByIdAndUpdate(token.patientId._id, { status: "completed" });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

export default router;
