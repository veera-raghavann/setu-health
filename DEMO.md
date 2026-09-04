# SETU — local demo guide

This is the fastest path to a live, working demo of **PRISM ↔ MedBridge**, the two
workstreams from the SIH26047 proposal ("Patient Case-Taking Software"), wired
together through a shared patient identity — as a faculty-facing walkthrough.

## What this demonstrates

```
Patient (PRISM)  →  intake + document OCR + evidence  →  shared patient pool
                                                                   │
Clinician (MedBridge)  ←  consented context + conflict detection  ┘
```

- **PRISM** (`apps/patient` + `services/prism-api`): a guided condition
  picker (fever, stomach pain, cough/cold, headache, body ache/injury, skin
  issue, or free text) drives a condition-specific question flow, live-
  translated into the patient's chosen language (10 Indian languages) with a
  🔊 speak-question button and voice input. Mid-conversation document upload
  runs real OCR and structured clinical evidence extraction (labs, vitals,
  medications), each with a page-level citation back to the source document.
- **Document approval**: extracted evidence starts as unverified OCR output.
  The patient reviews and approves it ("This looks right" / flag it wrong),
  and a clinician can separately confirm it into the case record in
  MedBridge — only evidence that has cleared at least one of those two gates
  is ever eligible for the ABDM push path.
- **MedBridge** (`apps/medbridge`): doctor-side consent flow that pulls the
  *same* patient's PRISM-side data alongside a seeded hospital-linked record
  set, then runs reconciliation — including a real cross-source conflict
  (a penicillin allergy documented at one hospital vs. "no known drug
  allergies" at another).
- **ABDM adapter** (`services/abdm/`): a real care-context-link → consent →
  push interface modeled on ABDM's actual HIP-side flow, defaulting to a
  clearly-labeled simulated implementation since the team's ABDM sandbox
  registration is pending — swappable to live sandbox calls with zero code
  changes once credentials arrive.
- Both sides read/write the same patient record through `services/prism-api`,
  which is the literal "link" between PRISM and MedBridge.

## Prerequisites

- Node.js 18+
- Python 3.10+
- **Tesseract OCR** on PATH (the OCR worker uses it — see below for why)

Install Tesseract on Windows:

```bash
winget install -e --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
```

On macOS: `brew install tesseract`. On Debian/Ubuntu: `apt install tesseract-ocr`.

### Why Tesseract instead of the PaddleOCR worker in `services/prism-ocr-worker/main.py`

The production design (see `docs/architecture/`) targets PaddleOCR. It's a
heavy, GPU-friendly ML stack that doesn't reliably install on every machine on
short notice. `services/prism-ocr-worker/main_lite.py` implements the exact
same `/v1/ocr` HTTP contract using Tesseract + PyMuPDF instead, so the rest of
the system (evidence extraction, FHIR projection, MedBridge) runs unmodified
against real OCR output. Swap `main_lite.py` back for `main.py` once
PaddleOCR is available — no other code changes needed.

## One-time setup

```bash
npm install
pip install -r services/prism-ocr-worker/requirements-lite.txt
```

## Run everything

```bash
npm run demo
```

This starts, in one terminal:

| Service | URL |
|---|---|
| OCR worker (Tesseract) | http://localhost:8100 |
| PRISM API | http://localhost:8000 |
| Patient app (PRISM) | http://localhost:5173 |
| MedBridge app | http://localhost:5174 |

Stop everything with `Ctrl+C` once (it kills all four).

## Demo script (~7 minutes)

### 1. Patient side — PRISM (localhost:5173)

1. Click **"I have a health concern"** while logged out → log in with any
   mobile number (demo OTP is shown directly on screen, no real SMS sent) →
   you land straight back in the intake flow.
2. Note the **demo Health ID** shown later on the ABHA workspace page —
   you'll use it on the MedBridge side.
3. You'll see a **condition card grid** (Fever, Stomach pain, Cough & cold,
   Headache, Body ache/injury, Skin issue, Something else). Switch the
   language dropdown to Hindi (or any of the 9 Indian languages) — the cards
   and every question translate live. Tap 🔊 to hear the current question
   read aloud.
4. Pick a condition (e.g. **Fever**) and answer its condition-specific
   questions (fever asks about pattern and associated symptoms, not the same
   script as stomach pain). Try typing in the local language, or the touch
   buttons — both work.
5. Mid-conversation, click **"Upload a photo instead"** and pick
   `docs/demo/sample_prescription.png` (included in this repo). Watch OCR
   run and structured evidence — lab results, vitals, medications — get
   extracted with source-page citations, inline in the conversation.
6. Finish the flow, then go to **Records** and click **"This looks right"**
   on one of the extracted evidence items — this is the patient-side
   approval step; nothing is treated as confirmed until reviewed.

### 2. Clinician side — MedBridge (localhost:5174)

1. Enter a doctor name and the **Health ID** from step 1.2 → **Request OTP**
   (again shown on screen for the demo) → **Verify & open session**.
2. The consented patient context shows hospital-linked demo records (a
   seeded stand-in for an ABDM-linked hospital pool), the PRISM-side health
   issue, *and* the extracted evidence items with their verification status.
3. Click **"Confirm into case record"** on an evidence item — this is the
   clinician-side approval gate; the status flips to `clinician_confirmed`.
4. Click **Run reconciliation** — MedBridge surfaces a genuine conflict:
   one hospital record documents a penicillin allergy, another documents "no
   known drug allergies," with a clinician recommendation attached.

### 3. The ABDM push gate (curl, to show the mechanism)

```bash
curl -X POST http://localhost:8000/v1/abdm/push -H "Content-Type: application/json" \
  -d '{"evidence_id":"<id>","patient_id":"<id>","abha_id":"<health id>","hiu":"demo-hospital"}'
```

Run this against an evidence item still at `source_extracted` — it's
rejected. Run it again after the patient/clinician confirm steps above — it
"pushes" (clearly labeled `engine:"simulated"`, since the team's real ABDM
sandbox registration is still pending).

### Talking points mapped to the proposal

- **PRISM = Collect & Integrate** — guided, condition-specific intake in the
  patient's own language, OCR, evidence, all with provenance.
- **Document approval** — nothing OCR extracts is treated as fact until a
  patient and/or clinician explicitly confirms it.
- **ABHA/ABDM boundary** — shared patient identity, explicit OTP consent on
  both sides, and a real (simulated-for-now) care-context-link → consent →
  push adapter gated on confirmed evidence only.
- **MedBridge = Reconcile & Understand** — cross-source contradiction
  detection with citations, not a black-box AI guess.
- **FHIR interoperability** — `GET /v1/patients/:id/fhir-bundle` projects the
  extracted evidence into FHIR R4 `Observation` / `MedicationStatement`
  resources.

## What's real vs. explicitly demo-scoped

**Real, working code paths:** OCR text extraction, regex-based clinical
evidence extraction, FHIR R4 projection, cross-source reconciliation logic,
condition-branching intake logic, live bidirectional translation (patient
text → English canonical → safety screening/protocol engine → translated
questions back), the patient/clinician evidence-approval state machine, and
full UI wiring between the patient and clinician apps through the shared API.

**Demo-scoped (and labeled as such in the UI itself):** OTP delivery (shown
on screen instead of sent by SMS), ABHA/ABDM identity (an in-memory shared
pool instead of the live ABDM sandbox), hospital records (a small seeded
dataset), the **translation provider** (MyMemory's free tier today — real but
modest quality on some phrases; swaps to Bhashini via `TRANSLATION_PROVIDER=
bhashini` once the team's sandbox key arrives, no code changes), and the
**ABDM push adapter** (simulates the real care-context-link → consent → push
flow's shape and gating rules; swaps to `ABDM_PROVIDER=sandbox` once
registered). This mirrors the repo's own engineering principle: *"Prototype ≠
production... demo data must never be represented as production
certification."*

## Troubleshooting

- **Port already in use**: something else is bound to 8000/8100/5173/5174.
  Stop it, or edit the port in that service's config.
- **OCR worker health check fails** (`tesseractAvailable: false`): Tesseract
  isn't on PATH. Re-open your terminal after installing it, or set
  `TESSERACT_CMD` to the full path to `tesseract.exe`.
- **Individual services**: `npm run dev` (API), `npm run dev:web` (patient),
  `npm run dev:medbridge` (MedBridge), `npm run dev:ocr` (OCR worker) each run
  standalone if you want to restart just one.
