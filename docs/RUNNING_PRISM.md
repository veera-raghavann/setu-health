# Running PRISM locally

## What starts

```text
PostgreSQL
    +
PRISM OCR Worker
    +
PRISM API
```

The patient web app can then be run separately with Vite.

## 1. Configure optional voice integration

Copy the API environment example and add BHASHINI server credentials only to the server environment.

Do not place provider secrets in frontend `VITE_*` variables for production.

## 2. Start backend services

```bash
docker compose up --build
```

Check:

- API: `http://localhost:8000/health`
- OCR worker: `http://localhost:8100/health`

## 3. Start patient web

```bash
npm install
npm run dev:web
```

Set:

```text
VITE_PRISM_API_URL=http://localhost:8000
```

## End-to-end smoke test

1. Start a current-health-issue intake.
2. Complete text or touch questions.
3. Test Tamil and Hindi language selection.
4. Upload an image or PDF.
5. Confirm the original file appears under Records.
6. Open the source file from the record list.
7. Confirm OCR evidence through `/v1/patients/:patientId/evidence`.
8. Confirm the FHIR projection through `/v1/patients/:patientId/fhir-bundle`.
9. Test voice only when BHASHINI runtime credentials and approved endpoint configuration are available.

## Production note

The compose file is a local integration environment, not a claim of production deployment. Production requires managed database/storage, secret management, TLS, identity and consent enforcement, and approved ABDM/BHASHINI integration credentials.
