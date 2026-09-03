# MediKiosk

AI-powered hospital kiosk patient intake system.

## What It Does

Patients walk up to the kiosk → auth (ABHA/OTP/Guest) → fill demographics → AI interview → vitals → scan documents → get queue token → doctor picks up from there.

## Tech

| Part | Stack |
|------|-------|
| Frontend | HTML, Tailwind CSS, Socket.io |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT, Zod |
| OCR | Python, PaddleOCR, LLaMA 3.2:3b (separate service) |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## Project Structure

```
├── frontend/
│   ├── index.html          # Kiosk screen (patient flow)
│   └── doctor.html         # Doctor panel (queue + verification)
├── backend/
│   ├── server.js           # Express entry
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Auth, errors, upload
│   └── seed.js             # Demo data
├── vercel.json
├── render.yaml
├── plan.md
└── ocr.md
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # add MONGODB_URI
npm run seed
npm start              # http://localhost:3000
```

## Demo Patients

| ABHA ID | Name | Complaint |
|---------|------|-----------|
| rahul456@abdm | Rahul Singh | Chest Pain |
| priya123@abdm | Priya Sharma | Fever |
| amit789@abdm | Amit Verma | Diabetes |

## Doctor Panel

- URL: `your-domain/doctor`
- Login: `admin` / `admin123`

## Docs

- `plan.md` — full architecture
- `ocr.md` — OCR service handoff for Python team
