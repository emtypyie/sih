# MediKiosk

### Smart India Hackathon 2026 — Problem ID: SIH26047

**Internal Hackathon | Indian Institute of Technology Madras**

**Team: EmtyBrains**

---

An AI-powered hospital kiosk system that digitizes patient intake — from registration to doctor handoff — reducing wait times and eliminating paper forms.

## Problem

Hospitals in India still rely on paper-based registration. Patients fill forms by hand, wait in long queues, and doctors receive incomplete information. There's no standardization, no triage, and no digital trail.

## Solution

MediKiosk replaces the entire paper intake process with a smart kiosk:

```
Patient arrives → ABHA/OTP auth → Demographics → AI Interview → Vitals →
Document scan (OCR + LLM) → Clinical summary → Priority token → Doctor review
```

## Live Demo

| Service | URL |
|---------|-----|
| Kiosk Frontend | [medikiosk.emtypyie.in](https://medikiosk.emtypyie.in) |
| Doctor Panel | [medikiosk.emtypyie.in/doctor](https://medikiosk.emtypyie.in/doctor) |
| Backend API | [cdn3.emtypyie.in](https://cdn3.emtypyie.in/api/health) |

## Features

### Patient Kiosk (`index.html`)
- **Multi-language** — English, Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali
- **ABDM Integration** — ABHA ID login, mobile OTP, guest mode
- **Adaptive AI Interview** — dynamic questions based on chief complaint (chest pain, fever, diabetes)
- **Red-flag triage** — auto-classifies Priority 1 (emergency) vs Priority 3 (routine)
- **Document OCR** — scan prescriptions, discharge cards, lab reports
- **14-point clinical summary** — auto-generated intake for the doctor
- **FHIR R4 export** — standardized healthcare data format
- **Senior mode** — large font, bigger touch targets

### Doctor Panel (`doctor.html`)
- **Real-time queue** — live token updates via Socket.io
- **Patient detail view** — demographics, vitals, interview answers, triage
- **Document verification** — view OCR results, verify or reject extracted data
- **Clinical report** — 14-point intake summary, FHIR download

### Backend
- **Node.js + Express** — REST API with JWT auth
- **MongoDB** — patient records, tokens, reports, documents
- **Socket.io** — real-time queue updates
- **OCR proxy** — forwards to Python PaddleOCR + LLaMA service
- **Zod validation** — request validation on all endpoints

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Tailwind CSS, Socket.io Client |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Auth | JWT, Zod validation |
| OCR | Python, PaddleOCR, LLaMA 3.2:3b |
| Real-time | Socket.io |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## Project Structure

```
├── index.html                  # Kiosk patient intake
├── doctor.html                 # Doctor clinical panel
├── frontend/doctor/            # Doctor panel (clean URL)
├── backend/
│   ├── server.js               # Express + Socket.io entry
│   ├── seed.js                 # Demo patient seeder
│   └── src/
│       ├── config/             # MongoDB, env vars
│       ├── models/             # Patient, Token, Report, Session, Document
│       ├── routes/             # auth, patients, interview, tokens, reports, doctor
│       ├── services/           # OTP, ABHA, interview engine, reports, FHIR
│       ├── socket/             # WebSocket handlers
│       ├── middleware/         # JWT auth, error handler, file upload
│       └── utils/              # Helpers, logger, error classes
├── vercel.json                 # Vercel routing
├── render.yaml                 # Render deployment
├── ocr.md                      # OCR service handoff doc
└── plan.md                     # Full architecture plan
```

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env      # add your MONGODB_URI
npm run seed              # populate demo patients
npm start                 # http://localhost:3000

# Frontend — open directly or deploy to Vercel
open index.html
```

## Demo Data

### ABHA IDs

| ABHA ID | Patient | Age/Gender | Complaint |
|---------|---------|------------|-----------|
| `rahul456@abdm` | Rahul Singh | 25M | Chest Pain |
| `priya123@abdm` | Priya Sharma | 32F | Fever |
| `amit789@abdm` | Amit Verma | 48M | Diabetes |

### Doctor Panel

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor` | `doctor123` | Doctor |

## API Endpoints

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/otp/send`, `/verify`, `/abha`, `/guest`, `GET /me` |
| Patients | `GET/PUT /api/patients/:id/*` (demographics, vitals, allergies, ROS, AYUSH, lifestyle) |
| Interview | `GET /questions`, `POST /answers`, `GET /progress` |
| Tokens | `POST /issue`, `GET /:id`, `GET /queue/:counter`, `PUT /call`, `/complete` |
| Reports | `POST /generate/:id`, `GET /:id`, `GET /:id/fhir` |
| Doctor | `POST /login`, `GET /queue`, `PUT /token/:id/call`, `GET /patient/:id`, `PUT /document/:id/verify` |
| OCR | `POST /api/ocr/upload` (proxy to Python service) |

## How It Works

1. **Patient** walks up to kiosk, authenticates via ABHA or OTP
2. **System** collects demographics, chief complaint, selects medical stream
3. **AI Interview** asks adaptive questions based on complaint, flags red flags
4. **Vitals** recorded (BP, sugar, pulse)
5. **AYUSH assessment** if Ayurveda stream selected (Prakriti, Agni, Koshtha, Vikriti)
6. **Document scan** — prescriptions/lab reports processed via OCR + LLaMA
7. **Clinical summary** generated — 14-point intake report
8. **Priority token** issued — Emergency (E), Urgent (U), or Routine (P)
9. **Doctor** picks up from queue panel, reviews all data, verifies documents

## Future Scope

- Real ABDM API integration
- Multi-language OCR (Hindi, Marathi prescriptions)
- Prescription generation in doctor panel
- Admin analytics dashboard
- Docker deployment
- Voice AI for hands-free kiosk interaction

## Team

| Name | Role |
|------|------|
| EmtyBrains | Backend, Frontend, Architecture |

---

Built for **Smart India Hackathon 2026** | IIT Madras Internal Round
