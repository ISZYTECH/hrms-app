# HRMS — Health Record Management System

Full-stack implementation of the HRMS proposed in the project document:
a Node.js/Express + MongoDB backend with real JWT authentication and
role-based access control, and a React frontend with a dashboard for
each of the four roles — **Patient, Doctor, Lab Technician, Admin**.

```
hrms-app/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React + Vite + Tailwind client
```

## 1. Set up the database

You need a MongoDB instance. Two easy options:

**Option A — MongoDB Atlas (free, no local install)**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Under Database Access, create a user + password
3. Under Network Access, allow your IP (or 0.0.0.0/0 for testing)
4. Copy the connection string — it looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hrms`

**Option B — Local MongoDB**
Install MongoDB Community Server (https://www.mongodb.com/try/download/community)
and run it. Your connection string will be `mongodb://127.0.0.1:27017/hrms`.

## 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGO_URI` — your connection string from step 1
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)

Email and SMS/voice-call credentials (`SMTP_*`, `TWILIO_*`) are **optional** —
if you leave them blank, the app automatically simulates those notifications
(logs them to the console and saves them to the database) so everything still
works end-to-end for a demo. Fill them in later to send real emails/SMS/calls:
- SMTP: any provider (Gmail app password, SendGrid, Mailtrap, etc.)
- Twilio: sign up at https://www.twilio.com, get a phone number, and copy
  your Account SID, Auth Token, and phone number into `.env`

Then create demo accounts and start the server:

```bash
npm run seed   # creates one demo user per role (see credentials below)
npm run dev    # starts on http://localhost:5000
```

## 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev             # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## 4. Demo accounts

After running `npm run seed` in the backend:

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@hrms.local    | password123 |
| Doctor| doctor@hrms.local   | password123 |
| Lab   | lab@hrms.local      | password123 |
| Patient| patient@hrms.local | password123 |

You can also register new patient/doctor/lab accounts from the app itself —
admin accounts are only created via the seed script or by an existing admin.

## What each role can do

- **Patient** — book appointments with doctors, view medical records &
  prescriptions, view lab results, set notification preferences (email/SMS/call)
- **Doctor** — view and confirm/cancel appointments, add diagnosis and
  prescriptions, which marks the appointment complete
- **Lab Technician** — search patients, upload lab results (patient is
  notified automatically)
- **Admin** — view system-wide stats, manage all users (change role,
  activate/deactivate accounts)

## How notifications work

Every appointment confirmation, lab result upload, and status change
triggers a notification through whichever channels the patient has opted
into (email/SMS/call, set in their Notifications tab). A background job
(`node-cron`, runs hourly) also automatically reminds patients about
confirmed appointments coming up in the next 24 hours.

If SMTP/Twilio aren't configured, notifications are logged to the backend
console and saved in the database with status `"simulated"` instead of
`"sent"` — so you can demo the full notification flow without needing paid
API keys.

## Security notes for going further

This implementation covers real authentication (bcrypt + JWT) and
role-based authorization on every route. Before any real deployment with
real patient data, you'd want to add: HTTPS everywhere, rate limiting on
auth routes, refresh tokens, audit logging, input sanitization beyond the
current validation, and a proper secrets manager instead of a `.env` file.

## Testing note

This backend was built and verified in a sandboxed environment without
outbound access to MongoDB's servers, so it's been checked via code review,
syntax validation, and live boot/route smoke tests — not yet run end-to-end
against a live database. Once you point it at a real MongoDB instance
(Atlas or local), test the full flow: register a doctor and a patient, book
an appointment, confirm it, add a diagnosis, upload a lab result, and check
that notifications appear (in the console if simulated, or your inbox/phone
if configured).
