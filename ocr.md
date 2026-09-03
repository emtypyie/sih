# OCR Service — Handoff Document

## Overview

Build a Python FastAPI microservice that handles medical document OCR + AI structuring. This service runs independently on **port 3001** and writes to a shared SQLite database.

## Tech Stack

| Component | Library | Version |
|-----------|---------|---------|
| HTTP Server | FastAPI + Uvicorn | latest |
| OCR Engine | PaddleOCR | 3.x |
| LLM Structuring | llama-cpp-python | latest |
| Image Processing | Pillow | latest |
| Database | sqlite3 (stdlib) | — |
| Model | llama-3.2-3b-instruct (GGUF Q4_K_M) | ~2GB |

## Directory Structure

```
ocr-service/
├── main.py                  # FastAPI app, entry point
├── requirements.txt         # pip dependencies
├── models/                  # auto-downloaded PaddleOCR models go here
├── uploads/                 # uploaded + processed images
│   ├── originals/           # raw uploads
│   └── webp/                # converted WebP copies
└── src/
    ├── __init__.py
    ├── converter.py         # Image → WebP (Pillow)
    ├── ocr_engine.py        # PaddleOCR wrapper
    ├── llm_structurer.py    # LLaMA text → structured JSON
    └── db.py                # SQLite access (shared medikiosk.db)
```

## Port

**3001** — bind to `0.0.0.0:3001`

```bash
uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

## API Endpoints

### `POST /api/ocr/upload`

Upload a document, run full pipeline, save results.

**Request** — `multipart/form-data`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image (JPG, PNG, PDF) or document |
| `patientId` | string | Yes | Patient ID from the main backend |

**Response** — `200 OK`:

```json
{
  "success": true,
  "documentId": 1,
  "rawText": "Dr. Sharma\nRx: Paracetamol 500mg\nDiagnosis: Viral Fever\nLab: HB 12.5",
  "structured": {
    "dx": "Viral Fever",
    "rx": "Paracetamol 500mg",
    "labs": "HB 12.5",
    "sx": ""
  },
  "status": "unverified",
  "webpUrl": "/api/ocr/123/image/1"
}
```

**Error responses**:
- `400` — No file uploaded or missing patientId
- `404` — Patient not found in database
- `500` — OCR or LLM processing failure

### `GET /api/ocr/{patientId}`

Get all OCR results for a patient.

**Response**:
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "filename": "prescription_001.jpg",
      "originalName": "prescription.jpg",
      "webpPath": "uploads/webp/doc_1.webp",
      "rawOcrText": "...",
      "structuredDx": "...",
      "structuredRx": "...",
      "structuredLabs": "...",
      "structuredSx": "...",
      "status": "unverified",
      "uploadedAt": "2026-09-03T10:30:00"
    }
  ]
}
```

### `GET /api/ocr/{patientId}/image/{docId}`

Serve the processed WebP image for a document.

**Response**: Binary WebP image with `Content-Type: image/webp`

### `GET /api/health`

**Response**:
```json
{ "status": "ok", "ocr_engine": "paddleocr", "llm": "llama-3.2-3b", "gpu": true }
```

## Database

**Shared SQLite file**: `D:\SIH\backend\medikiosk.db`

Enable WAL mode for concurrent access:

```python
import sqlite3
conn = sqlite3.connect("D:/SIH/backend/medikiosk.db", timeout=10)
conn.execute("PRAGMA journal_mode=WAL")
```

### Table: `documents`

```sql
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mimetype TEXT DEFAULT '',
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

**Note**: The main backend will ALTER this table to add OCR columns. Your service should use this schema:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mimetype TEXT DEFAULT '',
  original_path TEXT DEFAULT '',
  webp_path TEXT DEFAULT '',
  raw_ocr_text TEXT DEFAULT '',
  structured_dx TEXT DEFAULT '',
  structured_rx TEXT DEFAULT '',
  structured_labs TEXT DEFAULT '',
  structured_sx TEXT DEFAULT '',
  status TEXT DEFAULT 'processing',
  verified_by TEXT,
  verified_at TEXT,
  rejection_reason TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Status Values

| Status | Meaning |
|--------|---------|
| `processing` | File uploaded, OCR pipeline running |
| `unverified` | OCR complete, awaiting staff verification |
| `verified` | Staff confirmed OCR data is accurate |
| `rejected` | Staff rejected OCR extraction |

**Your service sets status to `unverified` after successful processing.**

## Pipeline

```
1. Receive upload
   └─ Validate file type (jpg, jpeg, png, pdf, tiff)

2. Save original to uploads/originals/
   └─ Filename: {patientId}_{timestamp}_{originalName}

3. Convert to WebP (Pillow)
   └─ Save to uploads/webp/{filename}.webp
   └─ Quality: 85, optimize: True

4. INSERT into documents table
   └─ status = 'processing'

5. PaddleOCR on the original image
   └─ Use lang='en' (add 'hi' for Hindi if needed)
   └─ Return concatenated text from all detected regions

6. LLaMA 3.2:3b structures the raw text
   └─ Send prompt with raw text
   └─ Parse JSON response → dx, rx, labs, sx
   └─ Fallback to regex if LLM fails

7. UPDATE documents row
   └─ Set raw_ocr_text, structured_dx/rx/labs/sx
   └─ Set status = 'unverified'

8. Return response to caller
```

## PaddleOCR Setup

```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

def extract_text(image_path):
    result = ocr.ocr(image_path, cls=True)
    lines = []
    for line in result:
        for word_info in line:
            text = word_info[1][0]
            confidence = word_info[1][1]
            if confidence > 0.5:
                lines.append(text)
    return "\n".join(lines)
```

## LLaMA Setup

### Download Model

```bash
# From Hugging Face - unsloth quantized GGUF
# ~2GB download
pip install huggingface-hub

python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='unsloth/llama-3.2-3b-Instruct-GGUF',
    filename='llama-3.2-3b-instruct-Q4_K_M.gguf',
    local_dir='models/'
)
"
```

### Load and Query

```python
from llama_cpp import Llama

llm = Llama(
    model_path="models/llama-3.2-3b-instruct-Q4_K_M.gguf",
    n_ctx=4096,
    n_gpu_layers=-1,  # offload all layers to GPU
    verbose=False
)

def structure_text(raw_text):
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical document parser. Extract structured data from the given medical document text.
Return ONLY valid JSON with these keys: dx, rx, labs, sx.
- dx: diagnosis
- rx: prescription / medicines
- labs: lab test results
- sx: surgery / procedures
If a field is not present, use empty string "".<|eot_id|><|start_header_id|>user<|end_header_id|>
Parse this medical document:
{raw_text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    output = llm(prompt, max_tokens=512, temperature=0.1)
    response = output["choices"][0]["text"].strip()

    # Parse JSON from response
    import json
    try:
        # Find JSON in response (may be wrapped in markdown)
        start = response.index("{")
        end = response.rindex("}") + 1
        return json.loads(response[start:end])
    except:
        return {"dx": "", "rx": "", "labs": "", "sx": ""}
```

## Error Handling

- If PaddleOCR fails → return empty rawText, empty structured fields, status `unverified`
- If LLaMA fails → fall back to regex parsing (see below), still set status `unverified`
- If DB write fails → return 500 with error message
- Never crash the service on a single bad document

## Regex Fallback (if LLaMA unavailable)

```python
import re

def regex_parse(text):
    dx, rx, labs, sx = "", "", "", ""
    for line in text.split("\n"):
        lower = line.lower()
        if any(w in lower for w in ["diagnosis", "dx", "disease"]):
            dx = re.sub(r".*?(?:diagnosis|dx|disease)\s*[:\-]?\s*", "", line, flags=re.I).strip()
        elif any(w in lower for w in ["prescription", "rx", "medicine", "tab", "cap"]):
            rx += ("; " if rx else "") + line.strip()
        elif any(w in lower for w in ["lab", "report", "hba1c", "hemoglobin", "cbc", "blood"]):
            labs += ("; " if labs else "") + line.strip()
        elif any(w in lower for w in ["surgery", "operation", "sx", "procedure"]):
            sx = re.sub(r".*?(?:surgery|operation|sx|procedure)\s*[:\-]?\s*", "", line, flags=re.I).strip()
    if not dx and text.strip():
        dx = text.strip().split("\n")[0]
    return {"dx": dx, "rx": rx, "labs": labs, "sx": sx}
```

## requirements.txt

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-multipart==0.0.9
paddleocr==2.7.0.3
paddlepaddle==2.6.1
llama-cpp-python==0.3.35
Pillow==10.4.0
aiofiles==24.1.0
huggingface-hub==0.25.0
```

**Note**: If `paddleocr==2.7.0.3` causes issues on Python 3.14, try `paddleocr==3.0.0` or install from source. PaddlePaddle CUDA support may require a separate install — check https://www.paddlepaddle.org.cn/en/install/quick

## GPU Configuration

- **RTX 4050 Laptop** (4GB VRAM)
- PaddleOCR: runs on CPU by default (fine)
- LLaMA: use `n_gpu_layers=-1` to offload to GPU, or `n_gpu_layers=20` if OOM
- If GPU OOM, fall back to CPU inference (slower but works)

## CORS

Allow requests from `http://localhost:3000` (main backend) and `http://localhost:3003` (doctor panel):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Health Check

The main backend will poll `/api/health` to verify OCR service is running. Return GPU availability status.

## Testing

```bash
# Start service
cd ocr-service
pip install -r requirements.txt
python main.py

# Test upload
curl -X POST http://localhost:3001/api/ocr/upload \
  -F "file=@test_prescription.jpg" \
  -F "patientId=pat_abc123"

# Test health
curl http://localhost:3001/api/health

# Test patient docs
curl http://localhost:3001/api/ocr/pat_abc123
```
