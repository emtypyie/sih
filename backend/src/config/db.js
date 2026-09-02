import Database from "better-sqlite3";
import { resolve } from "path";

const db = new Database(resolve("medikiosk.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    abha TEXT,
    phone TEXT,
    name TEXT DEFAULT '',
    age INTEGER DEFAULT 0,
    gender TEXT DEFAULT 'Male',
    stream TEXT DEFAULT 'allopathy',
    chief_complaint TEXT DEFAULT '',
    vitals_bp TEXT DEFAULT '',
    vitals_sugar TEXT DEFAULT '',
    vitals_pulse TEXT DEFAULT '',
    diet TEXT DEFAULT '',
    sleep TEXT DEFAULT '',
    ayush_prakriti TEXT DEFAULT '',
    ayush_agni TEXT DEFAULT '',
    ayush_koshtha TEXT DEFAULT '',
    ayush_vikriti TEXT DEFAULT '',
    ocr_dx TEXT DEFAULT '',
    ocr_rx TEXT DEFAULT '',
    ocr_labs TEXT DEFAULT '',
    ocr_sx TEXT DEFAULT '',
    is_red_flag INTEGER DEFAULT 0,
    triage_priority INTEGER DEFAULT 3,
    status TEXT DEFAULT 'in_progress',
    is_guest INTEGER DEFAULT 0,
    user_role TEXT DEFAULT 'self',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS patient_allergies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    allergy TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS patient_ros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    symptom TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS patient_family (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    history TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS interview_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_red INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS patient_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT DEFAULT '',
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    verified INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    token_number TEXT NOT NULL,
    counter TEXT DEFAULT '',
    priority INTEGER DEFAULT 3,
    status TEXT DEFAULT 'waiting',
    issued_at TEXT DEFAULT (datetime('now')),
    called_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL UNIQUE,
    summary TEXT DEFAULT '',
    structured_report TEXT DEFAULT '{}',
    fhir_bundle TEXT DEFAULT '{}',
    generated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`);

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export function connectDB() { return Promise.resolve(); }
export { db, genId, now };
