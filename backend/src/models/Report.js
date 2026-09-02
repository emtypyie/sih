import { db, genId, now } from "../config/db.js";

const Report = {
  upsert(patientId, data) {
    const existing = db.prepare("SELECT id FROM reports WHERE patient_id = ?").get(patientId);
    if (existing) {
      db.prepare("UPDATE reports SET summary = ?, structured_report = ?, fhir_bundle = ?, generated_at = ? WHERE id = ?")
        .run(data.summary || "", data.structuredReport || "{}", data.fhirBundle || "{}", now(), existing.id);
    } else {
      db.prepare("INSERT INTO reports (patient_id, summary, structured_report, fhir_bundle, generated_at) VALUES (?, ?, ?, ?, ?)")
        .run(patientId, data.summary || "", data.structuredReport || "{}", data.fhirBundle || "{}", now());
    }
    return this.findByPatientId(patientId);
  },
  findByPatientId(patientId) {
    const row = db.prepare("SELECT * FROM reports WHERE patient_id = ?").get(patientId);
    if (!row) return null;
    let structured = {};
    let fhir = {};
    try { structured = JSON.parse(row.structured_report); } catch {}
    try { fhir = JSON.parse(row.fhir_bundle); } catch {}
    return { ...row, structuredReport: structured, fhirBundle: fhir };
  },
};

export { Report };
