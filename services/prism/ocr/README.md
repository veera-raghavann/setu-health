# PRISM-003 — Medical Document Intelligence

PRISM-003 is the document-evidence service for SETU. It converts patient-held medical documents into structured, reviewable clinical evidence.

It is intentionally **not** an autonomous diagnostic system.

## Production architecture

```text
JPEG / PNG / WEBP / PDF
          │
          ▼
Secure ingestion
- file type validation
- size limits
- content verification
          │
          ▼
Document decoding
- image decoding
- multi-page PDF rendering
          │
          ▼
OpenCV preprocessing
- resize
- deskew
- contrast enhancement
          │
          ├──────────────► image quality assessment
          │
          ▼
PaddleOCR
- text extraction
- confidence
- bounding boxes
- page provenance
          │
          ▼
Clinical structuring
- document classification
- medication extraction
- laboratory extraction
- date extraction
          │
          ▼
LLM adapter boundary
(schema-constrained provider integration later)
          │
          ▼
Evidence-linked JSON contract
          │
          ▼
PRISM / Unified Patient Context
```

## Core design rules

1. **Evidence before inference.** Extracted claims must remain traceable to document text.
2. **No autonomous diagnosis.** The service structures evidence; clinicians remain decision-makers.
3. **Uncertainty is preserved.** Low-confidence OCR and poor image quality trigger review.
4. **Original records are not silently altered.**
5. **No PHI is intentionally written to application logs.** Logs use document IDs and operational metadata.
6. **Provider neutrality.** LLM integration sits behind an adapter boundary.
7. **Interoperability first.** Output is designed to become part of SETU's shared clinical context and later FHIR mapping.

## Supported inputs

| Format | Status |
|---|---|
| JPEG | Supported |
| PNG | Supported |
| WEBP | Supported |
| PDF | Supported, up to 20 pages in current MVP |
| HEIC | Planned |

## Evidence classification

Every material extracted entity is tagged with:

- clinical pathway: `allopathic`, `ayush`, `cross_cutting` or `unknown`
- source class: patient-reported, patient-provided document, ABDM exchange, clinician-confirmed or system-derived
- verification state: what was actually verified, without turning extraction into clinical truth
- resource origin: document ID, page and region/bounding box when available

OCR outputs from patient-held documents are classified as `patient_provided_document` with verification state `extracted_from_document`.

ABDM/FHIR records are not processed by this service. They must enter through the ABDM adapter as `abdm_exchange`. Exchange provenance is not equivalent to clinician confirmation.

AYUSH and allopathic context are preserved separately; AYUSH keyword inference in the current baseline is conservative and requires domain validation before production use.

## Current document classes

- Prescription
- Laboratory report
- Discharge summary
- OPD record
- Diagnostic report
- Radiology report
- Surgical record
- Referral letter
- Unknown

## API

### Health

```text
GET /health
```

### Process document

```text
POST /v1/documents/process
Content-Type: multipart/form-data
file=<document>
```

The response includes:

- document ID
- document classification
- raw OCR text
- medications
- lab observations
- dates
- source evidence
- page provenance
- OCR confidence
- bounding boxes
- image quality signals
- review-required state

## Local development

```bash
cd services/prism/ocr
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Open API documentation:

```text
http://localhost:8000/docs
```

Run tests:

```bash
pytest -q
```

## Docker

```bash
docker compose up --build
```

The service listens on port 8080 inside the container.

## LLM integration contract

The LLM layer is not allowed to become a free-form summarizer.

Before enabling a provider, it must satisfy:

- schema-constrained JSON output
- explicit document ID
- evidence references for extracted claims
- no unsupported clinical invention
- confidence / uncertainty handling
- deterministic validation after generation
- provider and prompt version tracking

The provider-neutral interface currently lives in:

```text
src/llm_adapter.py
```

## Before production deployment

The codebase now has a production-oriented service foundation, but real healthcare deployment still requires:

- approved clinical validation datasets
- handwritten Indian prescription benchmarking
- multilingual OCR evaluation
- load and concurrency testing
- malware/content scanning at the upload boundary
- authenticated service-to-service access
- secrets management
- encrypted object storage if originals must be retained
- retention and deletion policy
- DPDP / institutional security review
- observability and alerting
- approved LLM provider with clinical safety evaluation
- terminology normalization and FHIR mapping

These are deployment gates, not features to silently assume complete.

## Position inside SETU

```text
Patient voice history
        +
Touch answers
        +
Medical document evidence  ◄── PRISM-003
        +
ABDM / ABHA consented records
        │
        ▼
Unified Patient Context
        ▼
Clinical History Engine
        ▼
Physician-ready clinical view
```

PRISM-003 owns the transformation of **unstructured patient documents into evidence-linked clinical context**.
