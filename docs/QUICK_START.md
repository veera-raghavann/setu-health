# PRISM Quick Start

## Prerequisites

- Node.js 22 recommended
- Python 3.11+ for the OCR worker if running without Docker
- Docker Desktop for the easiest full backend stack

## Fastest way to see the current web app

### Terminal 1 — API and dependencies

```bash
git clone https://github.com/veera-raghavann/setu-health.git
cd setu-health
git checkout PRISM-001
docker compose up --build
```

Keep this terminal running.

### Terminal 2 — patient web app

```bash
cd setu-health
npm install
npm run dev:web
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

## Environment

Create `apps/patient/.env.local`:

```text
VITE_PRISM_API_URL=http://localhost:8000
```

Restart the Vite server after changing environment variables.

## What you can test now

1. Select English, Tamil or Hindi.
2. Choose Current Health Issue.
3. Type a symptom description.
4. Continue through the adaptive next-question flow.
5. Test touch answers.
6. Upload an image/PDF from Records.
7. Confirm the source file appears in Records.
8. Open the source resource.
9. Check backend health at `http://localhost:8000/health`.
10. Check OCR worker health at `http://localhost:8100/health`.

## Voice

Voice UI depends on valid BHASHINI runtime configuration. Do not put production BHASHINI credentials in frontend environment variables.

## Stop

Press `Ctrl+C` in each terminal.

For Docker cleanup:

```bash
docker compose down
```
