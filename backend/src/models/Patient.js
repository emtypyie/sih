import { db, genId, now } from "../config/db.js";

function rowToPatient(row) {
  if (!row) return null;
  const allergies = db.prepare("SELECT allergy FROM patient_allergies WHERE patient_id = ?").all(row.id).map(r => r.allergy);
  const ros = db.prepare("SELECT symptom FROM patient_ros WHERE patient_id = ?").all(row.id).map(r => r.symptom);
  const family = db.prepare("SELECT history FROM patient_family WHERE patient_id = ?").all(row.id).map(r => r.history);
  const interviewAnswers = db.prepare("SELECT question, answer, is_red FROM interview_answers WHERE patient_id = ?").all(row.id)
    .map(r => ({ question: r.question, answer: r.answer, isRed: !!r.is_red }));
  const documents = db.prepare("SELECT filename, original_name as originalName, mimetype, uploaded_at as uploadedAt FROM patient_documents WHERE patient_id = ?").all(row.id);

  return {
    _id: row.id,
    abha: row.abha,
    phone: row.phone,
    name: row.name,
    age: row.age,
    gender: row.gender,
    stream: row.stream,
    chiefComplaint: row.chief_complaint,
    vitals: { bp: row.vitals_bp, sugar: row.vitals_sugar, pulse: row.vitals_pulse },
    allergies,
    diet: row.diet,
    sleep: row.sleep,
    ros,
    family,
    ayush: { prakriti: row.ayush_prakriti, agni: row.ayush_agni, koshtha: row.ayush_koshtha, vikriti: row.ayush_vikriti },
    ocr: { dx: row.ocr_dx, rx: row.ocr_rx, labs: row.ocr_labs, sx: row.ocr_sx },
    interviewAnswers,
    isRedFlag: !!row.is_red_flag,
    triagePriority: row.triage_priority,
    documents,
    status: row.status,
    isGuest: !!row.is_guest,
    userRole: row.user_role,
  };
}

function updateArrays(patientId, table, column, values) {
  db.prepare(`DELETE FROM ${table} WHERE patient_id = ?`).run(patientId);
  const ins = db.prepare(`INSERT INTO ${table} (patient_id, ${column}) VALUES (?, ?)`);
  for (const v of values) {
    ins.run(patientId, v);
  }
}

const Patient = {
  create(data) {
    const id = genId();
    db.prepare(`
      INSERT INTO patients (id, abha, phone, name, age, gender, stream, chief_complaint,
        vitals_bp, vitals_sugar, vitals_pulse, diet, sleep,
        ayush_prakriti, ayush_agni, ayush_koshtha, ayush_vikriti,
        ocr_dx, ocr_rx, ocr_labs, ocr_sx,
        is_red_flag, triage_priority, status, is_guest, user_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.abha || null, data.phone || null, data.name || "", data.age || 0,
      data.gender || "Male", data.stream || "allopathy", data.chiefComplaint || "",
      data.vitals?.bp || "", data.vitals?.sugar || "", data.vitals?.pulse || "",
      data.diet || "", data.sleep || "",
      data.ayush?.prakriti || "", data.ayush?.agni || "", data.ayush?.koshtha || "", data.ayush?.vikriti || "",
      data.ocr?.dx || "", data.ocr?.rx || "", data.ocr?.labs || "", data.ocr?.sx || "",
      data.isRedFlag ? 1 : 0, data.triagePriority || 3, data.status || "in_progress",
      data.isGuest ? 1 : 0, data.userRole || "self"
    );
    if (data.allergies?.length) updateArrays(id, "patient_allergies", "allergy", data.allergies);
    if (data.ros?.length) updateArrays(id, "patient_ros", "symptom", data.ros);
    if (data.family?.length) updateArrays(id, "patient_family", "history", data.family);
    return this.findById(id);
  },

  findById(id) {
    const row = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    return rowToPatient(row);
  },

  findByIdAndUpdate(id, updates) {
    const fields = [];
    const vals = [];
    const map = {
      name: "name", age: "age", gender: "gender", abha: "abha", phone: "phone",
      stream: "stream", chiefComplaint: "chief_complaint", diet: "diet", sleep: "sleep",
      status: "status", isGuest: "is_guest", userRole: "user_role",
      triagePriority: "triage_priority",
    };
    for (const [k, v] of Object.entries(updates)) {
      if (map[k]) { fields.push(`${map[k]} = ?`); vals.push(v); }
    }
    if (updates.vitals) {
      if (updates.vitals.bp !== undefined) { fields.push("vitals_bp = ?"); vals.push(updates.vitals.bp); }
      if (updates.vitals.sugar !== undefined) { fields.push("vitals_sugar = ?"); vals.push(updates.vitals.sugar); }
      if (updates.vitals.pulse !== undefined) { fields.push("vitals_pulse = ?"); vals.push(updates.vitals.pulse); }
    }
    if (updates.ayush) {
      if (updates.ayush.prakriti !== undefined) { fields.push("ayush_prakriti = ?"); vals.push(updates.ayush.prakriti); }
      if (updates.ayush.agni !== undefined) { fields.push("ayush_agni = ?"); vals.push(updates.ayush.agni); }
      if (updates.ayush.koshtha !== undefined) { fields.push("ayush_koshtha = ?"); vals.push(updates.ayush.koshtha); }
      if (updates.ayush.vikriti !== undefined) { fields.push("ayush_vikriti = ?"); vals.push(updates.ayush.vikriti); }
    }
    if (updates.ocr) {
      if (updates.ocr.dx !== undefined) { fields.push("ocr_dx = ?"); vals.push(updates.ocr.dx); }
      if (updates.ocr.rx !== undefined) { fields.push("ocr_rx = ?"); vals.push(updates.ocr.rx); }
      if (updates.ocr.labs !== undefined) { fields.push("ocr_labs = ?"); vals.push(updates.ocr.labs); }
      if (updates.ocr.sx !== undefined) { fields.push("ocr_sx = ?"); vals.push(updates.ocr.sx); }
    }
    if (updates.isRedFlag !== undefined) { fields.push("is_red_flag = ?"); vals.push(updates.isRedFlag ? 1 : 0); }
    if (fields.length === 0) return this.findById(id);
    fields.push("updated_at = ?");
    vals.push(now(), id);
    db.prepare(`UPDATE patients SET ${fields.join(", ")} WHERE id = ?`).run(...vals);

    if (updates.allergies) updateArrays(id, "patient_allergies", "allergy", updates.allergies);
    if (updates.ros) updateArrays(id, "patient_ros", "symptom", updates.ros);
    if (updates.family) updateArrays(id, "patient_family", "history", updates.family);
    if (updates.interviewAnswers) {
      db.prepare("DELETE FROM interview_answers WHERE patient_id = ?").run(id);
      const ins = db.prepare("INSERT INTO interview_answers (patient_id, question, answer, is_red) VALUES (?, ?, ?, ?)");
      for (const a of updates.interviewAnswers) {
        ins.run(id, a.question || "", a.answer || "", a.isRed ? 1 : 0);
      }
    }
    return this.findById(id);
  },

  find(query = {}) {
    let sql = "SELECT * FROM patients";
    const conditions = [];
    const vals = [];
    for (const [k, v] of Object.entries(query)) {
      if (k === "abha") { conditions.push("abha = ?"); vals.push(v); }
      else if (k === "phone") { conditions.push("phone = ?"); vals.push(v); }
      else if (k === "status") { conditions.push("status = ?"); vals.push(v); }
    }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    return db.prepare(sql).all(...vals).map(rowToPatient);
  },

  findOne(query) {
    const results = this.find(query);
    return results[0] || null;
  },
};

export { Patient };
