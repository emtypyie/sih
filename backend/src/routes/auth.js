import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { sendOTP, verifyOTP } from "../services/otpService.js";
import { lookupByABHA, createGuest, createFromPhone } from "../services/abhaService.js";
import { authenticate } from "../middleware/auth.js";
import { Patient } from "../models/Patient.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

function signToken(patientId) {
  return jwt.sign({ patientId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

router.post("/otp/send", async (req, res, next) => {
  try {
    const { phone } = z.object({ phone: z.string().min(10).max(15) }).parse(req.body);
    const result = await sendOTP(phone);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.post("/otp/verify", async (req, res, next) => {
  try {
    const { phone, otp } = z.object({ phone: z.string().min(10), otp: z.string().length(6) }).parse(req.body);
    await verifyOTP(phone, otp);
    const patient = await createFromPhone(phone);
    const token = signToken(patient._id);
    res.json({ success: true, token, patient });
  } catch (err) { next(err); }
});

router.post("/abha", async (req, res, next) => {
  try {
    const { abhaId } = z.object({ abhaId: z.string().min(1) }).parse(req.body);
    const patient = await lookupByABHA(abhaId);
    const token = signToken(patient._id);
    res.json({ success: true, token, patient });
  } catch (err) { next(err); }
});

router.post("/guest", async (req, res, next) => {
  try {
    const patient = await createGuest();
    const token = signToken(patient._id);
    res.json({ success: true, token, patient });
  } catch (err) { next(err); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const patient = Patient.findById(req.patientId);
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

export default router;
