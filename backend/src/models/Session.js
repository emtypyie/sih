import { db, genId, now } from "../config/db.js";

const Session = {
  create(data) {
    const id = genId();
    db.prepare("INSERT INTO sessions (id, phone, otp, expires_at, verified) VALUES (?, ?, ?, ?, 0)")
      .run(id, data.phone, data.otp, data.expiresAt);
    return this.findById(id);
  },
  findById(id) {
    return db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) || null;
  },
  findOne(query) {
    let sql = "SELECT * FROM sessions WHERE verified = 0";
    const vals = [];
    if (query.phone) { sql += " AND phone = ?"; vals.push(query.phone); }
    sql += " ORDER BY id DESC LIMIT 1";
    return db.prepare(sql).get(...vals) || null;
  },
  update(id, data) {
    const fields = [];
    const vals = [];
    if (data.verified !== undefined) { fields.push("verified = ?"); vals.push(data.verified ? 1 : 0); }
    if (fields.length) { vals.push(id); db.prepare(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`).run(...vals); }
  },
  deleteExpired() {
    db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  },
};

export { Session };
