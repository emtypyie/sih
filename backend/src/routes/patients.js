import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/:id", async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/demographics", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().optional(), age: z.coerce.number().optional(), gender: z.enum(["Male", "Female", "Other"]).optional(), abha: z.string().optional() }).parse(req.body);
    const patient = await Patient.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/stream", async (req, res, next) => {
  try {
    const { stream, chiefComplaint } = z.object({ stream: z.enum(["ayush", "allopathy"]), chiefComplaint: z.string().optional() }).parse(req.body);
    const patient = await Patient.findByIdAndUpdate(req.params.id, { stream, chiefComplaint }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/vitals", async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { vitals: req.body }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/allergies", async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { allergies: req.body.allergies || [] }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/ros", async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { ros: req.body.ros || [], family: req.body.family || [] }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/ayush", async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { ayush: req.body }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

router.put("/:id/lifestyle", async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { diet: req.body.diet, sleep: req.body.sleep }, { new: true });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, patient });
  } catch (err) { next(err); }
});

export default router;
