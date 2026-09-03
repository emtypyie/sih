# MediKiosk — Architecture Plan

## System Overview

```
┌─────────────────────────────────────────┐
│              Vercel (Frontend)            │
│  index.html (Kiosk) + doctor.html       │
│  Static files, served at / and /doctor   │
└──────────────────┬──────────────────────┘
                   │ API calls + WebSocket
                   ▼
┌─────────────────────────────────────────┐
│            Render (Backend)              │
│  Node.js Express on port 3000           │
│  All routes: auth, patients, tokens,    │
│  reports, interview, doctor panel,      │
│  OCR proxy                             │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐  ┌──────────────────┐
│  MongoDB Atlas   │  │ Python OCR Svc   │
│  (Database)      │  │ Port 3001        │
│                  │  │ (by OCR team)    │
└─────────────────┘  └──────────────────┘
```

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://medikiosk.emtypyie.in` |
| Backend | Render | `https://sih2026-otfr.onrender.com` |
| Database | MongoDB Atlas | Connection string in `.env` |
| OCR | Local/Cloud | Port 3001 (built by OCR team) |

## Frontend Routes (Vercel)

- `/` → `index.html` (Kiosk patient intake)
- `/doctor` → `doctor.html` (Doctor panel)

## API Routes (Render)

### Patient Auth
- `POST /api/auth/otp/send` — Send OTP
- `POST /api/auth/otp/verify` — Verify OTP → JWT
- `POST /api/auth/abha` — ABHA lookup → JWT
- `POST /api/auth/guest` — Guest session
- `GET /api/auth/me` — Current patient

### Patient Data
- `GET /api/patients/:id`
- `PUT /api/patients/:id/demographics`
- `PUT /api/patients/:id/stream`
- `PUT /api/patients/:id/vitals`
- `PUT /api/patients/:id/allergies`
- `PUT /api/patients/:id/ros`
- `PUT /api/patients/:id/ayush`
- `PUT /api/patients/:id/lifestyle`

### Interview
- `GET /api/interview/:patientId/questions`
- `POST /api/interview/:patientId/answers`
- `GET /api/interview/:patientId/progress`

### Tokens
- `POST /api/tokens/issue`
- `GET /api/tokens/:id`
- `GET /api/tokens/queue/:counter`
- `PUT /api/tokens/:id/call`
- `PUT /api/tokens/:id/complete`

### Reports
- `POST /api/reports/generate/:patientId`
- `GET /api/reports/:patientId`
- `GET /api/reports/:patientId/fhir`
- `GET /api/reports/doctor/:patientId`

### Doctor Panel
- `POST /api/doctor/auth/login`
- `GET /api/doctor/queue`
- `PUT /api/doctor/token/:id/call`
- `PUT /api/doctor/token/:id/complete`
- `GET /api/doctor/patient/:id`
- `GET /api/doctor/patient/:id/documents`
- `PUT /api/doctor/document/:id/verify`
- `PUT /api/doctor/document/:id/reject`

### OCR Proxy
- `POST /api/ocr/upload` → Proxied to Python OCR service
- `GET /api/ocr/:patientId` → Proxied to Python OCR service

### Health
- `GET /api/health`

## Database Schema (MongoDB)

- **Patient** — demographics, vitals, allergies, ROS, family, AYUSH, OCR, interview, triage
- **Token** — queue tokens with priority and status
- **Report** — clinical summaries + FHIR bundles
- **Session** — OTP sessions
- **Document** — OCR uploaded documents with verification status

## Verification Flow

```
Upload → "processing" → "unverified" → "verified" (staff approves)
                                        → "rejected" (staff rejects)
```

## Implementation Status

| Component | Status |
|-----------|--------|
| Backend (MongoDB) | Done |
| Doctor panel backend | Done (merged into main) |
| Doctor panel frontend | Done |
| Kiosk frontend | Done |
| Vercel config | Done |
| Render config | Done |
| OCR service | Handoff doc (ocr.md) |

## Next Steps

1. User provides MongoDB Atlas connection string
2. Update `MONGODB_URI` in `.env`
3. Run `npm run seed` to populate demo patients
4. Deploy backend to Render
5. Deploy frontend to Vercel
6. OCR team builds Python service per ocr.md
