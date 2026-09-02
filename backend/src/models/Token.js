import { db, genId, now } from "../config/db.js";

const Token = {
  create(data) {
    const id = genId();
    db.prepare("INSERT INTO tokens (id, patient_id, token_number, counter, priority, status, issued_at) VALUES (?, ?, ?, ?, ?, 'waiting', ?)")
      .run(id, data.patientId, data.tokenNumber, data.counter || "", data.priority || 3, now());
    return this.findById(id);
  },
  findById(id) {
    const row = db.prepare("SELECT * FROM tokens WHERE id = ?").get(id);
    if (!row) return null;
    const patient = db.prepare("SELECT name, abha, chief_complaint FROM patients WHERE id = ?").get(row.patient_id);
    return { ...row, patientId: row.patient_id, tokenNumber: row.token_number, patientName: patient?.name, patientAbha: patient?.abha };
  },
  findByPatientId(patientId) {
    return db.prepare("SELECT * FROM tokens WHERE patient_id = ? ORDER BY id DESC LIMIT 1").get(patientId);
  },
  findQueue(counter) {
    return db.prepare("SELECT * FROM tokens WHERE counter = ? AND status IN ('waiting', 'called') ORDER BY priority ASC, issued_at ASC")
      .all(counter);
  },
  updateStatus(id, status) {
    const field = status === "called" ? "called_at" : status === "completed" ? "completed_at" : "";
    if (field) {
      db.prepare(`UPDATE tokens SET status = ?, ${field} = ? WHERE id = ?`).run(status, now(), id);
    } else {
      db.prepare("UPDATE tokens SET status = ? WHERE id = ?").run(status, id);
    }
    return this.findById(id);
  },
};

export { Token };
