# PRISM-003 — Medical Document Intelligence

PRISM OCR is not a document scanner. It is the medical-document evidence pipeline for SETU.

## Pipeline

```text
Patient document
      ↓
OpenCV preprocessing
      ↓
PaddleOCR text + layout extraction
      ↓
Document classification
      ↓
Clinical structuring layer
      ↓
Evidence-linked structured output
      ↓
PRISM unified clinical context
```

## MVP stack

| Layer | Technology |
|---|---|
| Image preprocessing | OpenCV |
| OCR | PaddleOCR |
| API | FastAPI |
| Clinical structuring | Deterministic baseline → LLM adapter |
| Output | Pydantic JSON contract |

## What the service preserves

Every output must preserve:

- source document identifier
- page provenance
- OCR confidence
- bounding-box evidence when available
- extracted raw text
- structured clinical entities
- event date versus ingestion date when known
- uncertainty requiring human review

Low-confidence handwriting, ambiguous units, and uncertain medication names must remain reviewable by a human. OCR output is never treated as autonomous clinical truth.

## Supported document classes

Current target classes:

1. Prescriptions
2. Laboratory reports
3. Discharge summaries
4. OPD records
5. Diagnostic reports
6. Radiology reports
7. Surgical records
8. Referral letters

## Current implementation

The first runnable MVP now contains:

- OpenCV resize, deskew and contrast enhancement
- PaddleOCR extraction with confidence and bounding boxes
- Evidence preservation
- Initial document classification
- Baseline medication, lab and date extraction
- FastAPI processing endpoint
- Tests for core structuring behaviour

## Run locally

```bash
cd services/prism/ocr
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Then upload an image:

```text
POST /v1/documents/process
multipart/form-data
file=<medical-document-image>
```

## LLM direction

The LLM is deliberately an adapter boundary rather than a free-form postprocessor.

The production structuring layer must eventually:

- receive OCR text and evidence
- classify document type
- extract diagnoses, medications, investigations and procedures
- return schema-constrained JSON
- link each extracted claim to source evidence
- preserve uncertainty
- never silently invent missing clinical facts

The current deterministic structurer is the safe baseline while the LLM provider and structured-output contract are finalized.

## Integration position

```text
Conversation history
        +
Voice transcript
        +
OCR document evidence
        +
ABDM / ABHA records
        ↓
Unified Patient Context
        ↓
Clinical History Engine
        ↓
Physician-ready summary
```

PRISM-003 therefore owns **medical document evidence ingestion**, not final diagnosis or autonomous clinical decision-making.
