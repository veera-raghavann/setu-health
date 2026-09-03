# PRISM API

## Current architecture

- Fastify HTTP API
- Intake session repository
- PostgreSQL-ready persistence
- Development in-memory fallback
- Backend-owned clinical conversation state
- Evidence model prepared for provenance and care-pathway classification

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Without DATABASE_URL the service runs with ephemeral development storage.

## Database

Apply:

```bash
psql "$DATABASE_URL" -f migrations/001_initial.sql
```

No clinical record should be treated as clinician-confirmed merely because it exists in the database.