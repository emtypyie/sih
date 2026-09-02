import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient.js";
import { Token } from "../models/Token.js";
import { authenticate } from "../middleware/auth.js";
import { generateTokenNumber } from "../utils/helpers.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();
router.use(authenticate);

router.post("/issue", async (req, res, next) => {
  try {
    const { patientId, counter, priority } = z.object({ patientId: z.string(), counter: z.string().optional(), priority: z.coerce.number().min(1).max(3).default(3) }).parse(req.body);
    const patient = Patient.findById(patientId);
    if (!patient) throw new NotFoundError("Patient");

    const tokenNumber = generateTokenNumber(priority);
    const token = Token.create({ patientId, tokenNumber, counter: counter || "", priority });
    Patient.findByIdAndUpdate(patientId, { status: "token_issued" });

    const io = req.app.get("io");
    if (io) io.emit("token:issued", { token: tokenNumber, patientId, patientName: patient.name, counter, priority });

    res.json({ success: true, token: { ...token, patientName: patient.name } });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const token = Token.findById(req.params.id);
    if (!token) throw new NotFoundError("Token");
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

router.get("/queue/:counter", async (req, res, next) => {
  try {
    const queue = Token.findQueue(req.params.counter);
    res.json({ success: true, queue });
  } catch (err) { next(err); }
});

router.put("/:id/call", async (req, res, next) => {
  try {
    const token = Token.updateStatus(req.params.id, "called");
    if (!token) throw new NotFoundError("Token");
    const io = req.app.get("io");
    if (io) io.emit("token:called", { token: token.tokenNumber, counter: token.counter });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

router.put("/:id/complete", async (req, res, next) => {
  try {
    const token = Token.updateStatus(req.params.id, "completed");
    if (!token) throw new NotFoundError("Token");
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

export default router;
