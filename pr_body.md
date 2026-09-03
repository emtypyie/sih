## MediKiosk — Complete Backend, Doctor Panel & Deployment Configs

### Summary
Full Node.js backend for the MediKiosk hospital patient intake system with MongoDB, integrated doctor panel, and deployment configs for Vercel + Render.

---

### What's Included

#### Backend (Node.js/Express — port 3000)
- **Auth**: OTP (Fast2SMS), ABHA lookup, Guest mode, JWT
- **Patient CRUD**: demographics, vitals, allergies, ROS, family, AYUSH, lifestyle
- **Adaptive AI Interview**: chest/fever/diabetes question sets with red-flag triage
- **Queue Token System**: Emergency (E), Urgent (U), Routine (P) priorities
- **Clinical Reports**: 14-point intake summary generation
- **FHIR R4 Export**: standard healthcare data bundle
- **Doctor Panel Endpoints**: queue management, patient detail, document verification
- **OCR Proxy**: forwards to Python OCR service (port 3001)
- **Socket.io**: real-time queue & patient updates

#### Frontend
- **`index.html`** — Kiosk patient intake (auth → demographics → stream → interview → vitals → AYUSH → OCR → summary → token)
- **`doctor.html`** — Doctor panel (login → queue dashboard → patient detail → document verification → reports)

#### Database (MongoDB/Mongoose)
- `Patient` — full patient record with nested objects (vitals, ayush, ocr, interview)
- `Token` — queue tokens with priority/status
- `Report` — clinical summaries + FHIR bundles
- `Session` — OTP sessions
- `Document` — OCR documents with verification workflow (processing → unverified → verified/rejected)

#### Deployment Configs
- **`vercel.json`** — frontend routing (`/` → kiosk, `/doctor` → doctor panel)
- **`render.yaml`** — backend service config for Render

---

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT + Zod validation |
| Frontend | Tailwind CSS + FontAwesome |
| Deployment | Vercel (frontend) + Render (backend) |

---

### Demo Data

#### ABHA IDs

| ABHA ID | Patient | Age/Gender | Complaint |
|---------|---------|------------|-----------|
| `rahul456@abdm` | Rahul Singh | 25M | Chest Pain |
| `priya123@abdm` | Priya Sharma | 32F | Fever |
| `amit789@abdm` | Amit Verma | 48M | Diabetes Follow Up |

#### Doctor Panel Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor` | `doctor123` | Doctor |

---

### Project Structure

```
├── index.html              # Kiosk frontend
├── doctor.html             # Doctor panel frontend
├── backend/
│   ├── server.js           # Express + Socket.io entry
│   ├── seed.js             # Demo patient seeder
│   ├── src/
│   │   ├── config/         # MongoDB + env validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # WebSocket handlers
│   │   ├── middleware/      # JWT auth, error handler
│   │   └── utils/          # Helpers, logger
│   └── uploads/            # Uploaded documents
├── vercel.json             # Vercel deployment
├── render.yaml             # Render deployment
├── ocr.md                  # OCR service handoff
└── plan.md                 # Architecture plan
```

---

### Setup Instructions

```bash
cd backend
cp .env.example .env  # Add MONGODB_URI
npm install
npm run seed  # Populate demo patients
npm start     # Runs on port 3000
```

### Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `FAST2SMS_API_KEY` | OTP SMS API key |
| `ALLOWED_ORIGINS` | CORS origins |
| `OCR_SERVICE_URL` | Python OCR service URL |
