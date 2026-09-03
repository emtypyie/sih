# MediKiosk Backend

Node.js backend for the MediKiosk hospital patient intake system.

**Problem ID:** SIH26047 | **Team:** EmtyBrains | **Hackathon:** SIH 2026, IIT Madras

**Problem:** There is no purpose-built, patient-facing software platform that enables patients to independently and comprehensively record their medical history — through both natural spoken conversation and guided touchscreen interaction — and simultaneously digitize their existing physical medical documents, generating a structured, physician-ready clinical history summary that integrates with the hospital information system and the ABDM ecosystem before the patient enters the consultation room.

## Quick Start

```bash
npm install
cp .env.example .env    # add MONGODB_URI
npm run seed             # seed demo patients
npm start                # http://localhost:3000
```

## Tech

| Layer | Tech |
|-------|------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT + Zod |
| Upload | Multer |
| SMS | Fast2SMS API |
| Logging | Pino |

## Project Structure

```
backend/
├── server.js               # Express + Socket.io entry
├── seed.js                 # Demo patient seeder
├── src/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── env.js          # Zod env validation
│   ├── models/
│   │   ├── Patient.js      # demographics, vitals, allergies, ROS, AYUSH, OCR, interview
│   │   ├── Token.js        # queue tokens (E/U/P priority)
│   │   ├── Report.js       # clinical summaries + FHIR
│   │   ├── Session.js      # OTP sessions
│   │   └── Document.js     # OCR docs with verification workflow
│   ├── routes/
│   │   ├── auth.js         # OTP, ABHA, guest, JWT
│   │   ├── patients.js     # CRUD for patient data
│   │   ├── interview.js    # adaptive questions + red flags
│   │   ├── tokens.js       # queue management
│   │   ├── reports.js      # clinical summary + FHIR
│   │   └── doctor.js       # doctor panel (queue, verify docs)
│   ├── services/
│   │   ├── otpService.js   # OTP generation + Fast2SMS
│   │   ├── abhaService.js  # ABHA lookup + demo data
│   │   ├── interviewService.js  # question engine
│   │   ├── reportService.js     # 14-point summary
│   │   └── fhirService.js       # FHIR R4 bundle
│   ├── socket/
│   │   └── index.js        # Socket.io events
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── errorHandler.js # error handling
│   │   └── upload.js       # multer config
│   └── utils/
│       ├── errors.js       # custom error classes
│       ├── helpers.js      # OTP/token generation
│       └── logger.js       # pino config
└── uploads/                # uploaded documents
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
FAST2SMS_API_KEY=your_api_key
FAST2SMS_ROUTE=otp
OTP_EXPIRY_MINUTES=5
ALLOWED_ORIGINS=https://medikiosk.emtypyie.in
NODE_ENV=development
OCR_SERVICE_URL=http://localhost:3001
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/send` | Send OTP to phone |
| POST | `/api/auth/otp/verify` | Verify OTP, get JWT |
| POST | `/api/auth/abha` | ABHA ID lookup |
| POST | `/api/auth/guest` | Guest session |
| GET | `/api/auth/me` | Get current patient |

### Patients (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/:id` | Get patient |
| PUT | `/api/patients/:id/demographics` | Update name, age, gender |
| PUT | `/api/patients/:id/stream` | Set allopathy/ayush |
| PUT | `/api/patients/:id/vitals` | Update BP, sugar, pulse |
| PUT | `/api/patients/:id/allergies` | Update allergies |
| PUT | `/api/patients/:id/ros` | Update ROS + family |
| PUT | `/api/patients/:id/ayush` | Update AYUSH data |
| PUT | `/api/patients/:id/lifestyle` | Update diet, sleep |

### Interview (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interview/:id/questions` | Get questions for complaint |
| POST | `/api/interview/:id/answers` | Submit answers |
| GET | `/api/interview/:id/progress` | Get progress |

### Tokens (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tokens/issue` | Issue queue token |
| GET | `/api/tokens/:id` | Get token |
| GET | `/api/tokens/queue/:counter` | Get queue |
| PUT | `/api/tokens/:id/call` | Call patient |
| PUT | `/api/tokens/:id/complete` | Mark done |

### Reports (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate/:id` | Generate 14-point summary |
| GET | `/api/reports/:id` | Get report |
| GET | `/api/reports/:id/fhir` | Download FHIR bundle |

### Doctor Panel (Doctor JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctor/auth/login` | Staff login |
| GET | `/api/doctor/queue` | Get all active tokens |
| PUT | `/api/doctor/token/:id/call` | Call patient |
| PUT | `/api/doctor/token/:id/complete` | Complete visit |
| GET | `/api/doctor/patient/:id` | Patient detail |
| GET | `/api/doctor/patient/:id/documents` | Patient docs |
| PUT | `/api/doctor/document/:id/verify` | Verify OCR doc |
| PUT | `/api/doctor/document/:id/reject` | Reject OCR doc |

### OCR
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/upload` | Proxy to Python OCR service |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `token:issued` | Server → Client | `{ token, patientId, counter, priority }` |
| `token:called` | Server → Client | `{ token, counter }` |
| `patient:update` | Server → Client | `{ patientId, field, value }` |

## Demo ABHA IDs

| ABHA ID | Patient | Complaint |
|---------|---------|-----------|
| `rahul456@abdm` | Rahul Singh, 25M | Chest Pain |
| `priya123@abdm` | Priya Sharma, 32F | Fever |
| `amit789@abdm` | Amit Verma, 48M | Diabetes |

## Doctor Panel Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor` | `doctor123` | Doctor |

## Scripts

```bash
npm start        # production
npm run dev      # development with --watch
npm run seed     # seed demo patients
```

## Deployment

Set these in Render dashboard:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Auto-generated |
| `NODE_ENV` | production |
| `ALLOWED_ORIGINS` | https://medikiosk.emtypyie.in |

---

Built for **Smart India Hackathon 2026** | IIT Madras | Team EmtyBrains
