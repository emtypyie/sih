# MediKiosk Backend

Node.js backend for the MediKiosk hospital patient intake system.

## Quick Start

```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | SQLite (better-sqlite3) |
| Real-time | Socket.io |
| OCR | Tesseract.js (server-side) |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| File Upload | Multer |
| SMS OTP | Fast2SMS API |
| Logging | Pino |

## Project Structure

```
backend/
├── server.js                 # Entry point - Express + Socket.io setup
├── seed.js                   # Seed demo ABHA patients
├── .env                      # Environment variables
├── medikiosk.db              # SQLite database (auto-created)
├── uploads/                  # Uploaded documents
└── src/
    ├── config/
    │   ├── db.js             # SQLite connection + schema
    │   └── env.js            # Env var validation
    ├── middleware/
    │   ├── auth.js           # JWT verification
    │   ├── errorHandler.js   # Central error handler
    │   └── upload.js         # Multer file upload config
    ├── models/
    │   ├── Patient.js        # Patient CRUD + arrays (allergies, ROS, family)
    │   ├── Session.js        # OTP sessions
    │   ├── Token.js          # Queue tokens
    │   └── Report.js         # Clinical reports
    ├── routes/
    │   ├── auth.js           # Auth endpoints
    │   ├── patients.js       # Patient data endpoints
    │   ├── interview.js      # AI interview endpoints
    │   ├── ocr.js            # Document OCR endpoints
    │   ├── tokens.js         # Queue token endpoints
    │   └── reports.js        # Report generation endpoints
    ├── services/
    │   ├── otpService.js     # OTP generation + Fast2SMS
    │   ├── abhaService.js    # ABHA lookup + demo data
    │   ├── interviewService.js # Adaptive question engine
    │   ├── ocrService.js     # Tesseract.js wrapper
    │   ├── reportService.js  # 14-point clinical summary
    │   └── fhirService.js    # FHIR R4 bundle export
    ├── socket/
    │   └── index.js          # WebSocket event handlers
    └── utils/
        ├── errors.js         # Custom error classes
        ├── helpers.js        # OTP/token generation
        └── logger.js         # Pino logger config
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `24h` | Token expiry duration |
| `FAST2SMS_API_KEY` | `YOUR_FAST2SMS_API_KEY_HERE` | Fast2SMS API key for OTP |
| `OTP_EXPIRY_MINUTES` | `5` | OTP validity in minutes |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `NODE_ENV` | `development` | Environment mode |

## API Endpoints

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/otp/send` | `{ phone }` | Send OTP via SMS |
| `POST` | `/api/auth/otp/verify` | `{ phone, otp }` | Verify OTP, returns JWT |
| `POST` | `/api/auth/abha` | `{ abhaId }` | Lookup by ABHA ID, returns JWT |
| `POST` | `/api/auth/guest` | — | Create guest session |
| `GET` | `/api/auth/me` | — | Get current patient (requires JWT) |

### Patient Data (requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/patients/:id` | — | Get patient by ID |
| `PUT` | `/api/patients/:id/demographics` | `{ name, age, gender, abha }` | Update demographics |
| `PUT` | `/api/patients/:id/stream` | `{ stream, chiefComplaint }` | Set medical stream |
| `PUT` | `/api/patients/:id/vitals` | `{ bp, sugar, pulse }` | Update vitals |
| `PUT` | `/api/patients/:id/allergies` | `{ allergies: [] }` | Update allergies |
| `PUT` | `/api/patients/:id/ros` | `{ ros: [], family: [] }` | Update ROS + family |
| `PUT` | `/api/patients/:id/ayush` | `{ prakriti, agni, koshtha, vikriti }` | Update AYUSH data |
| `PUT` | `/api/patients/:id/lifestyle` | `{ diet, sleep }` | Update lifestyle |

### Interview (requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/interview/:patientId/questions` | — | Get adaptive questions |
| `POST` | `/api/interview/:patientId/answers` | `{ answers: [] }` | Submit answers, check red flags |
| `GET` | `/api/interview/:patientId/progress` | — | Get interview progress |

### OCR (requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ocr/upload` | `multipart: document, patientId` | Upload + process document |
| `GET` | `/api/ocr/:patientId/results` | — | Get OCR results |

### Tokens (requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/tokens/issue` | `{ patientId, counter, priority }` | Issue queue token |
| `GET` | `/api/tokens/:id` | — | Get token details |
| `GET` | `/api/tokens/queue/:counter` | — | Get queue for counter |
| `PUT` | `/api/tokens/:id/call` | — | Call next patient |
| `PUT` | `/api/tokens/:id/complete` | — | Mark token completed |

### Reports (requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reports/generate/:patientId` | — | Generate 14-point clinical summary |
| `GET` | `/api/reports/:patientId` | — | Get patient report |
| `GET` | `/api/reports/:patientId/fhir` | — | Download FHIR R4 JSON |
| `GET` | `/api/reports/doctor/:patientId` | — | Doctor dashboard view |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check (returns `{ status: "ok" }`) |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `patient:update` | Server → Client | `{ patientId, field, value }` |
| `token:issued` | Server → Client | `{ token, patientId, counter, priority }` |
| `token:called` | Server → Client | `{ token, counter }` |

## Database Schema

SQLite tables created automatically on first run:

- **patients** — Main patient record (demographics, vitals, AYUSH, OCR, triage)
- **patient_allergies** — Allergy list (FK → patients)
- **patient_ros** — Review of systems symptoms (FK → patients)
- **patient_family** — Family history (FK → patients)
- **interview_answers** — AI interview Q&A (FK → patients)
- **patient_documents** — Uploaded file records (FK → patients)
- **sessions** — OTP sessions (phone, OTP, expiry)
- **tokens** — Queue tokens (priority, counter, status)
- **reports** — Generated clinical summaries + FHIR bundles

## Demo ABHA IDs

| ABHA ID | Patient | Complaint |
|---------|---------|-----------|
| `rahul456@abdm` | Rahul Singh, 25M | Chest Pain |
| `priya123@abdm` | Priya Sharma, 32F | Fever |
| `amit789@abdm` | Amit Verma, 48M | Diabetes Follow Up |

## Scripts

```bash
npm start          # Production start
npm run dev        # Development with file watch
npm run seed       # Seed demo patients
```
