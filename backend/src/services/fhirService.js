import { Patient } from "../models/Patient.js";

export async function generateFHIR(patientId) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const bundle = {
    resourceType: "Bundle",
    type: "document",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: `abdm-${patientId}`,
          identifier: [{ system: "https://healthid.abdm.gov.in", value: patient.abha || "unknown" }],
          name: [{ text: patient.name }],
          gender: (patient.gender || "male").toLowerCase(),
        },
      },
      {
        resource: {
          resourceType: "Condition",
          clinicalStatus: { coding: [{ code: "active" }] },
          code: { text: patient.chiefComplaint || "Not specified" },
          subject: { reference: `Patient/abdm-${patientId}` },
        },
      },
    ],
  };

  if (patient.allergies?.length) {
    patient.allergies.forEach((a) => {
      if (a === "No Known Drug Allergies") return;
      bundle.entry.push({
        resource: { resourceType: "AllergyIntolerance", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: a }, patient: { reference: `Patient/abdm-${patientId}` } },
      });
    });
  }

  if (patient.vitals?.bp) {
    bundle.entry.push({
      resource: { resourceType: "Observation", code: { text: "Blood Pressure" }, valueString: patient.vitals.bp, subject: { reference: `Patient/abdm-${patientId}` } },
    });
  }

  return bundle;
}
