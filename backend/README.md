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
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| File Upload | Multer |
| SMS OTP | Fast2SMS API |
| Logging | Pino |

## Deployment

- **Backend**: Render (Node.js service)
- **Frontend**: Vercel (static HTML)
- **Database**: MongoDB Atlas

## Project Structure

```
backend/
├── server.js                 # Entry point - Express + Socket.io setup
├── seed.js                   # Seed demo ABHA patients
├── .env                      # Environment variables
├── uploads/                  # Uploaded documents
└── src/
    ├── config/
    │   ├── db.js             # MongoDB connection
    │   └── env.js            # Env var validation
    ├── middleware/
    │   ├── auth.js           # JWT verification
    │   ├── errorHandler.js   # Central error handler
    │   └── upload.js         # Multer file upload config
    ├── models/
    │   ├── Patient.js        # Patient schema (demographics, vitals, AYUSH, OCR)
    │   ├── Session.js        # OTP sessions
    │   ├── Token.js          # Queue tokens
    │   ├── Report.js         # Clinical reports
    │   └── Document.js       # OCR documents with verification
    ├── routes/
    │   ├── auth.js           # Patient auth (OTP, ABHA, guest)
    │   ├── patients.js       # Patient data endpoints
    │   ├── interview.js      # AI interview endpoints
    │   ├── tokens.js         # Queue token endpoints
    │   ├── reports.js        # Report generation endpoints
    │   └── doctor.js         # Doctor panel endpoints (auth, queue, verify)
    ├── services/
    │   ├── otpService.js     # OTP generation + Fast2SMS
    │   ├── abhaService.js    # ABHA lookup + demo data
    │   ├── interviewService.js # Adaptive question engine
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
| `MONGODB_URI` | `mongodb://localhost:27017/medikiosk` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `24h` | Token expiry duration |
| `FAST2SMS_API_KEY` | `YOUR_FAST2SMS_API_KEY_HERE` | Fast2SMS API key for OTP |
| `OTP_EXPIRY_MINUTES` | `5` | OTP validity in minutes |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `NODE_ENV` | `development` | Environment mode |
| `OCR_SERVICE_URL` | `http://localhost:3001` | Python OCR service URL |

## API Endpoints

### Patient Authentication

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
| `POST` | `/api/ocr/upload` | `multipart: document, patientId` | Proxy to Python OCR service |
| `GET` | `/api/ocr/:patientId` | — | Get OCR results |

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

### Doctor Panel (requires doctor JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/doctor/auth/login` | `{ username, password }` | Staff login |
| `GET` | `/api/doctor/queue` | — | Get all active tokens |
| `PUT` | `/api/doctor/token/:id/call` | — | Call patient |
| `PUT` | `/api/doctor/token/:id/complete` | — | Complete visit |
| `GET` | `/api/doctor/patient/:id` | — | Full patient detail |
| `GET` | `/api/doctor/patient/:id/documents` | — | Get patient documents |
| `PUT` | `/api/doctor/document/:id/verify` | — | Verify OCR document |
| `PUT` | `/api/doctor/document/:id/reject` | `{ reason }` | Reject OCR document |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `patient:update` | Server → Client | `{ patientId, field, value }` |
| `token:issued` | Server → Client | `{ token, patientId, counter, priority }` |
| `token:called` | Server → Client | `{ token, counter }` |

## Demo ABHA IDs

| ABHA ID | Patient | Complaint |
|---------|---------|-----------|
| `rahul456@abdm` | Rahul Singh, 25M | Chest Pain |
| `priya123@abdm` | Priya Sharma, 32F | Fever |
| `amit789@abdm` | Amit Verma, 48M | Diabetes Follow Up |

## Doctor Panel Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor` | `doctor123` | Doctor |

## Scripts

```bash
npm start          # Production start
npm run dev        # Development with file watch
npm run seed       # Seed demo patients (requires MongoDB)
```
