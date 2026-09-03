# MediKiosk Backend

The server that powers MediKiosk — handles patient data, authentication, queue management, document processing, and everything the frontend needs.

**Problem ID:** SIH26047 | **Team:** EmtyBrains | **Hackathon:** SIH 2026, IIT Madras

## What is this?

A Node.js backend that manages the full patient intake flow — from login to treatment history to doctor handoff. It stores patient records, processes documents, manages the queue, and generates clinical summaries.

## Tech

| Part | What |
|------|------|
| Server | Node.js + Express |
| Database | MongoDB |
| Real-time | Socket.io |
| Auth | JWT |
| Upload | Multer |
| SMS | Fast2SMS |

## What it does

### Patient Auth
- ABHA ID login (lookup patient by health ID)
- Phone OTP login (send code, verify)
- Guest mode (emergency walk-ins)
- JWT tokens for session management

### Patient Data
- Store demographics (name, age, gender)
- Record vitals (BP, sugar, pulse)
- Track allergies, diet, sleep
- Review of systems (symptoms checklist)
- Family history
- AYUSH assessment (Prakriti, Agni, Koshtha, Vikriti)
- Lifestyle info

### AI Interview
- Adaptive questions based on complaint (chest pain, fever, diabetes)
- Red flag detection (emergency symptoms)
- Auto-triage priority assignment

### Treatment History
- Store diagnoses, medications, surgeries from OCR
- Build treatment history across visits
- Link past records to current patient

### Queue Management
- Issue priority tokens (Emergency / Urgent / Routine)
- Real-time queue updates via Socket.io
- Call patients, mark visits complete

### Clinical Reports
- Generate 14-point intake summary
- Export FHIR R4 bundles (healthcare standard)
- Doctor can view full patient case

### Document Verification
- Store OCR-processed documents
- Track verification status (processing → unverified → verified/rejected)
- Doctor verifies extracted data before it's trusted

### Doctor Panel
- Staff login with hardcoded credentials
- View real-time patient queue
- See full patient case history
- Verify or reject OCR documents
- View clinical reports

## API Endpoints

### Auth
- `POST /api/auth/otp/send` — send OTP
- `POST /api/auth/otp/verify` — verify OTP, get token
- `POST /api/auth/abha` — ABHA lookup
- `POST /api/auth/guest` — guest login
- `GET /api/auth/me` — current patient

### Patients
- `GET /api/patients/:id` — get patient
- `PUT /api/patients/:id/demographics` — update name/age/gender
- `PUT /api/patients/:id/stream` — set allopathy/ayush
- `PUT /api/patients/:id/vitals` — update vitals
- `PUT /api/patients/:id/allergies` — update allergies
- `PUT /api/patients/:id/ros` — update symptoms + family
- `PUT /api/patients/:id/ayush` — update AYUSH data
- `PUT /api/patients/:id/lifestyle` — update diet/sleep

### Interview
- `GET /api/interview/:id/questions` — get questions for complaint
- `POST /api/interview/:id/answers` — submit answers
- `GET /api/interview/:id/progress` — get progress

### Tokens
- `POST /api/tokens/issue` — issue token
- `GET /api/tokens/:id` — get token
- `GET /api/tokens/queue/:counter` — get queue
- `PUT /api/tokens/:id/call` — call patient
- `PUT /api/tokens/:id/complete` — mark done

### Reports
- `POST /api/reports/generate/:id` — generate summary
- `GET /api/reports/:id` — get report
- `GET /api/reports/:id/fhir` — download FHIR

### Doctor Panel
- `POST /api/doctor/auth/login` — staff login
- `GET /api/doctor/queue` — all active tokens
- `PUT /api/doctor/token/:id/call` — call patient
- `PUT /api/doctor/token/:id/complete` — complete visit
- `GET /api/doctor/patient/:id` — patient detail
- `GET /api/doctor/patient/:id/documents` — patient docs
- `PUT /api/doctor/document/:id/verify` — verify document
- `PUT /api/doctor/document/:id/reject` — reject document

### Other
- `POST /api/ocr/upload` — proxy to Python OCR service
- `GET /api/health` — health check

## WebSocket Events

- `token:issued` — when a token is generated
- `token:called` — when doctor calls a patient
- `patient:update` — when patient data changes

## Demo Data

### ABHA IDs

| ABHA ID | Patient | Complaint |
|---------|---------|-----------|
| `rahul456@abdm` | Rahul Singh | Chest Pain |
| `priya123@abdm` | Priya Sharma | Fever |
| `amit789@abdm` | Amit Verma | Diabetes |

### Doctor Login

| Username | Password |
|----------|----------|
| `admin` | `admin123` |
| `doctor` | `doctor123` |

## Deployment

This runs on Render. You need to set these environment variables:

| Variable | What to put |
|----------|------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any random secret key |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://medikiosk.emtypyie.in` |

---

Built for **Smart India Hackathon 2026** | IIT Madras | Team EmtyBrains
