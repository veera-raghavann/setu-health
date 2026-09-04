# PRISM API

## Current architecture

- Fastify HTTP API
- Adaptive pre-consultation case-taking
- Patient-side shared health context
- PostgreSQL-ready persistence
- Development in-memory fallback
- Voice, text and touch intake continuity
- OCR evidence linked to original sources
- MedBridge-ready consented patient context
- Live SMS OTP support through textbee.dev

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Without DATABASE_URL the service runs with ephemeral development storage.

## Live SMS OTP

The patient OTP flow is already implemented at:

- `POST /v1/abha/otp/request`
- `POST /v1/abha/otp/verify`

To enable real SMS delivery, add the following only to your local `.env` or deployment secret manager:

```env
TEXTBEE_API_KEY=your_real_textbee_api_key
TEXTBEE_DEVICE_ID=your_textbee_device_id
```

Never commit the real API key to GitHub. When configured, PRISM sends the six-digit verification OTP through textbee.dev. If credentials are absent, the application automatically falls back to demo OTP mode for hackathon demonstrations.

## Database

Apply:

```bash
psql "$DATABASE_URL" -f migrations/001_initial.sql
```

No clinical record should be treated as clinician-confirmed merely because it exists in the database.
