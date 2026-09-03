# MediKiosk

### Smart India Hackathon 2026 — Problem ID: SIH26047

**Internal Hackathon | Indian Institute of Technology Madras**

**Team: EmtyBrains**

---

## What is this?

MediKiosk is a patient case and treatment history tracking system. It helps patients record their full medical history — through talking or touching a screen — and digitizes their old prescriptions and lab reports. Everything gets organized into a clean summary that the doctor can see before the patient even walks into the room.

## The Problem (SIH26047)

Right now, there's no good way for patients to sit down and properly record their own medical history. They can't easily talk through their symptoms, upload old prescriptions, or build a treatment record that follows them across visits. Doctors start from scratch every time. Paper forms get lost. Information slips through the cracks.

## What we built

A kiosk + doctor panel that handles the full patient intake flow:

```
Patient walks in → ABHA/OTP login → Basic info → AI asks questions →
Vitals check → Scan old documents → Build treatment history →
Doctor gets a full summary before seeing the patient
```

The key thing — it's not just collecting data for one visit. It builds a **treatment history** that grows over time. Every visit adds to the patient's case record. Doctors can see past diagnoses, medications, surgeries, and lab results all in one place.

## Live Links

| What | Where |
|------|-------|
| Kiosk (patient screen) | [medikiosk.emtypyie.in](https://medikiosk.emtypyie.in) |
| Doctor panel | [medikiosk.emtypyie.in/doctor](https://medikiosk.emtypyie.in/doctor) |
| Backend API | [cdn3.emtypyie.in](https://cdn3.emtypyie.in/api/health) |

## What it does

### For the Patient (Kiosk)
- Pick your language — English, Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali
- Login with ABHA ID, phone OTP, or walk in as guest
- AI asks you questions based on what's wrong (chest pain, fever, diabetes, etc.)
- Records vitals — BP, sugar, pulse
- Scans your old prescriptions and lab reports (OCR + AI reads them)
- Builds your treatment history — diagnoses, medications, surgeries, lab values
- Prints a priority token — Emergency, Urgent, or Routine

### For the Doctor (Panel)
- See the queue in real-time — who's waiting, who's called
- Open any patient's full case — demographics, vitals, interview answers, past treatments
- Verify or reject what the AI extracted from documents
- View the 14-point clinical summary
- Download FHIR format data (healthcare standard)

## Tech Stack

| Part | What we used |
|------|-------------|
| Frontend | HTML, Tailwind CSS, Socket.io |
| Backend | Node.js, Express.js, MongoDB |
| Real-time | Socket.io |
| Auth | JWT |
| OCR | Python, PaddleOCR, LLaMA 3.2:3b |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## How it works (step by step)

1. Patient shows up at the kiosk
2. Logs in with ABHA or phone number
3. System checks if they've been here before — pulls old treatment history
4. Patient confirms their info and describes what's wrong
5. AI asks smart follow-up questions based on the complaint
6. If anything looks serious, it flags as emergency
7. Vitals get recorded
8. Patient scans old prescriptions, discharge cards, lab reports
9. AI reads the documents and adds to their treatment history
10. System generates a clinical summary with everything organized
11. Patient gets a priority token
12. Doctor sees the full case file before calling them in
13. Doctor verifies the AI-extracted data
14. Patient's record is ready for next visit

## Demo Accounts

### Patient ABHA IDs

| ABHA ID | Name | Complaint |
|---------|------|-----------|
| `rahul456@abdm` | Rahul Singh | Chest Pain |
| `priya123@abdm` | Priya Sharma | Fever |
| `amit789@abdm` | Amit Verma | Diabetes |

### Doctor Login

| Username | Password |
|----------|----------|
| `admin` | `admin123` |
| `doctor` | `doctor123` |

## What's next

- Connect to real ABDM APIs for pulling treatment history
- Read Hindi and Marathi prescriptions (OCR)
- Visual timeline of patient's treatment history
- Generate prescriptions from doctor panel
- Compare cases across visits
- Voice AI so patients can just talk instead of tapping
- Analytics dashboard for hospital admins

---

Built for **Smart India Hackathon 2026** | IIT Madras Internal Round | Team EmtyBrains
