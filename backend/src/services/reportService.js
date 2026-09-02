import { Patient } from "../models/Patient.js";
import { Report } from "../models/Report.js";
import { NotFoundError } from "../utils/errors.js";

export async function generateReport(patientId) {
  const patient = Patient.findById(patientId);
  if (!patient) throw new NotFoundError("Patient");

  const lines = [];
  lines.push(`=== 14-POINT CLINICAL INTAKE SUMMARY ===`);
  lines.push(`Patient: ${patient.name} | Age: ${patient.age} | Gender: ${patient.gender}`);
  lines.push(`ABHA: ${patient.abha || "N/A"} | Stream: ${(patient.stream || "allopathy").toUpperCase()}`);
  lines.push(`Chief Complaint: ${patient.chiefComplaint || "Not specified"}`);
  lines.push(`Triage: ${patient.isRedFlag ? "PRIORITY 1 (EMERGENCY)" : "PRIORITY 3 (ROUTINE)"}`);
  lines.push(`--- VITALS ---`);
  lines.push(`BP: ${patient.vitals?.bp || "N/A"} | Sugar: ${patient.vitals?.sugar || "N/A"} | Pulse: ${patient.vitals?.pulse || "N/A"}`);
  lines.push(`--- ALLERGIES ---`);
  lines.push((patient.allergies || []).join(", ") || "None reported");
  lines.push(`--- LIFESTYLE ---`);
  lines.push(`Diet: ${patient.diet || "N/A"} | Sleep: ${patient.sleep || "N/A"}`);
  lines.push(`--- REVIEW OF SYSTEMS ---`);
  lines.push((patient.ros || []).join("; ") || "None reported");
  lines.push(`--- FAMILY HISTORY ---`);
  lines.push((patient.family || []).join("; ") || "None reported");

  if (patient.stream === "ayush" && patient.ayush) {
    lines.push(`--- AYUSH PARIKSHA ---`);
    lines.push(`Prakriti: ${patient.ayush.prakriti || "N/A"}`);
    lines.push(`Agni: ${patient.ayush.agni || "N/A"}`);
    lines.push(`Koshtha: ${patient.ayush.koshtha || "N/A"}`);
    lines.push(`Vikriti: ${patient.ayush.vikriti || "N/A"}`);
  }

  if (patient.ocr && (patient.ocr.dx || patient.ocr.rx)) {
    lines.push(`--- DOCUMENT OCR DATA ---`);
    lines.push(`Dx: ${patient.ocr.dx || "N/A"}`);
    lines.push(`Rx: ${patient.ocr.rx || "N/A"}`);
    lines.push(`Labs: ${patient.ocr.labs || "N/A"}`);
    lines.push(`Sx: ${patient.ocr.sx || "N/A"}`);
  }

  lines.push(`--- AI INTERVIEW RESPONSES ---`);
  (patient.interviewAnswers || []).forEach((a, i) => {
    lines.push(`${i + 1}. Q: ${a.question}`);
    lines.push(`   A: ${a.answer}${a.isRed ? " [RED FLAG]" : ""}`);
  });

  const summary = lines.join("\n");
  const structured = JSON.stringify({
    demographics: { name: patient.name, age: patient.age, gender: patient.gender, abha: patient.abha },
    chiefComplaint: patient.chiefComplaint,
    triage: patient.isRedFlag ? "Priority 1" : "Priority 3",
    vitals: patient.vitals, allergies: patient.allergies,
    lifestyle: { diet: patient.diet, sleep: patient.sleep },
    ros: patient.ros, family: patient.family,
    ayush: patient.stream === "ayush" ? patient.ayush : undefined,
    ocr: patient.ocr,
  });

  const report = Report.upsert(patientId, { summary, structuredReport: structured });
  Patient.findByIdAndUpdate(patientId, { status: "completed" });
  return report;
}

export async function getReport(patientId) {
  const report = Report.findByPatientId(patientId);
  if (!report) throw new NotFoundError("Report");
  return report;
}
