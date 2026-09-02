import { createWorker } from "tesseract.js";
import { logger } from "../utils/logger.js";

export async function processOCR(imagePath) {
  try {
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(imagePath);
    await worker.terminate();

    const parsed = parseOCRText(text);
    return { rawText: text, parsed };
  } catch (err) {
    logger.error("OCR processing failed:", err);
    return {
      rawText: "",
      parsed: { dx: "", rx: "", labs: "", sx: "" },
    };
  }
}

function parseOCRText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  let dx = "",
    rx = "",
    labs = "",
    sx = "";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("diagnosis") || lower.includes("dx")) {
      dx = line.replace(/.*(?:diagnosis|dx)\s*[:\-]?\s*/i, "").trim();
    } else if (lower.includes("prescription") || lower.includes("rx") || lower.includes("medicine")) {
      rx = line.replace(/.*(?:prescription|rx|medicine)\s*[:\-]?\s*/i, "").trim();
    } else if (lower.includes("lab") || lower.includes("report") || lower.includes("hba1c") || lower.includes("hemoglobin")) {
      labs += (labs ? ", " : "") + line;
    } else if (lower.includes("surgery") || lower.includes("operation") || lower.includes("sx")) {
      sx = line.replace(/.*(?:surgery|operation|sx)\s*[:\-]?\s*/i, "").trim();
    }
  }

  if (!dx && lines.length > 0) dx = lines[0];
  if (!rx && lines.length > 1) rx = lines[1];

  return { dx, rx, labs, sx };
}
