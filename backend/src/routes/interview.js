import { Router } from "express";
import { Patient } from "../models/Patient.js";
import { authenticate } from "../middleware/auth.js";
import { getQuestions, checkRedFlags } from "../services/interviewService.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const router = Router();
router.use(authenticate);

router.get("/:patientId/questions", async (req, res, next) => {
  try {
    const patient = Patient.findById(req.params.patientId);
    if (!patient) throw new NotFoundError("Patient");
    const questions = getQuestions(patient.chiefComplaint);
    res.json({ success: true, questions, total: questions.length });
  } catch (err) { next(err); }
});

router.post("/:patientId/answers", async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) throw new ValidationError("answers must be an array");

    const patient = Patient.findById(req.params.patientId);
    if (!patient) throw new NotFoundError("Patient");

    const formatted = answers.map((a) => ({ question: a.question || "", answer: a.answer || "", isRed: !!a.isRed }));
    const isRedFlag = checkRedFlags(formatted);
    const triagePriority = isRedFlag ? 1 : 3;

    Patient.findByIdAndUpdate(req.params.patientId, {
      interviewAnswers: formatted,
      isRedFlag,
      triagePriority,
    });

    const io = req.app.get("io");
    if (io) io.emit("patient:update", { patientId: req.params.patientId, field: "interviewComplete", value: true, isRedFlag });

    res.json({ success: true, isRedFlag, triagePriority });
  } catch (err) { next(err); }
});

router.get("/:patientId/progress", async (req, res, next) => {
  try {
    const patient = Patient.findById(req.params.patientId);
    if (!patient) throw new NotFoundError("Patient");
    res.json({ success: true, answersCount: (patient.interviewAnswers || []).length, isRedFlag: patient.isRedFlag });
  } catch (err) { next(err); }
});

export default router;
