import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient.js";
import { authenticate } from "../middleware/auth.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();
router.use(authenticate);

router.get("/:id", async (req, res, next) => {
  try {
    const patient = Patient.findById(req.params.id);
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/demographics", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().optional(), age: z.coerce.number().optional(), gender: z.enum(["Male", "Female", "Other"]).optional(), abha: z.string().optional() }).parse(req.body);
    const patient = Patient.findByIdAndUpdate(req.params.id, data);
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/stream", async (req, res, next) => {
  try {
    const { stream, chiefComplaint } = z.object({ stream: z.enum(["ayush", "allopathy"]), chiefComplaint: z.string().optional() }).parse(req.body);
    const patient = Patient.findByIdAndUpdate(req.params.id, { stream, chiefComplaint });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/vitals", async (req, res, next) => {
  try {
    const patient = Patient.findByIdAndUpdate(req.params.id, { vitals: req.body });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/allergies", async (req, res, next) => {
  try {
    const patient = Patient.findByIdAndUpdate(req.params.id, { allergies: req.body.allergies || [] });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/ros", async (req, res, next) => {
  try {
    const patient = Patient.findByIdAndUpdate(req.params.id, { ros: req.body.ros || [], family: req.body.family || [] });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/ayush", async (req, res, next) => {
  try {
    const patient = Patient.findByIdAndUpdate(req.params.id, { ayush: req.body });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/lifestyle", async (req, res, next) => {
  try {
    const patient = Patient.findByIdAndUpdate(req.params.id, { diet: req.body.diet, sleep: req.body.sleep });
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

export default router;
