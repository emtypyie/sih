import dns from "dns";
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { Patient } from "./src/models/Patient.js";
import { logger } from "./src/utils/logger.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const SEED_PATIENTS = [
  {
    abha: "rahul456@abdm",
    name: "Rahul Singh",
    age: 25,
    gender: "Male",
    chiefComplaint: "Chest Pain",
    vitals: { bp: "150/100", sugar: "142 mg/dL", pulse: "97% | 88 bpm" },
    allergies: ["Penicillin Allergy"],
    diet: "Vegetarian",
    sleep: "6-7 Hours Daily",
    ros: ["Resp: Breathlessness on Exertion", "Card: Palpitations", "GI: Heartburn & Acidity"],
    family: ["Father: CAD", "Mother: Diabetes", "Hypertension"],
    ayush: {
      prakriti: "Vata-Pitta (Vata 45%, Pitta 35%, Kapha 20%)",
      agni: "Vishama Agni",
      koshtha: "Krura Koshtha",
      vikriti: "Pitta Vriddhi",
    },
    ocr: {
      dx: "Type 2 DM, Hypertension",
      rx: "Metformin 500mg, Amlodipine 5mg",
      labs: "HbA1c: 8.2% ↑, BP: 150/100 ↑",
      sx: "Appendectomy (2022)",
    },
  },
  {
    abha: "priya123@abdm",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    chiefComplaint: "Fever",
    vitals: { bp: "120/80", sugar: "95 mg/dL", pulse: "98% | 82 bpm" },
    allergies: ["No Known Drug Allergies"],
    diet: "Mixed Diet",
    sleep: "7-8 Hours Daily",
    ros: ["GI: Mild nausea"],
    family: ["No significant family history"],
    ayush: {
      prakriti: "Kapha-Pitta",
      agni: "Sama Agni",
      koshtha: "Mrudu Koshtha",
      vikriti: "Kapha Vriddhi",
    },
    ocr: { dx: "", rx: "", labs: "", sx: "" },
  },
  {
    abha: "amit789@abdm",
    name: "Amit Verma",
    age: 48,
    gender: "Male",
    chiefComplaint: "Diabetes Follow Up",
    vitals: { bp: "140/90", sugar: "180 mg/dL", pulse: "96% | 76 bpm" },
    allergies: ["Sulfa Drugs"],
    diet: "Vegetarian",
    sleep: "5-6 Hours Daily",
    ros: ["Neuro: Tingling in feet", "Eye: Blurred vision"],
    family: ["Father: CAD", "Mother: Diabetes"],
    ayush: {
      prakriti: "Pitta-Kapha",
      agni: "Manda Agni",
      koshtha: "Krura Koshtha",
      vikriti: "Pitta-Kapha Vriddhi",
    },
    ocr: {
      dx: "Type 2 DM, HTN, Dyslipidemia",
      rx: "Metformin 1000mg, Amlodipine 5mg, Atorvastatin 10mg",
      labs: "HbA1c: 8.2% ↑, Fasting Sugar: 180 ↑, PP: 240 ↑",
      sx: "CABG (2020)",
    },
  },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  logger.info("Connected to MongoDB for seeding");

  await Patient.deleteMany({});
  logger.info("Cleared existing patients");

  await Patient.insertMany(SEED_PATIENTS);
  logger.info(`Seeded ${SEED_PATIENTS.length} demo patients`);

  await mongoose.disconnect();
  logger.info("Done. Disconnected from MongoDB.");
}

seed().catch((err) => {
  logger.error("Seeding failed:", err);
  process.exit(1);
});
