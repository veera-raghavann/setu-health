# OCR → Evidence Pipeline

## Goal

Convert a patient-owned image or PDF into structured, provenance-preserving evidence without treating OCR output as clinician-verified fact.

## Pipeline

```
Original Resource
      ↓
Pre-processing
      ↓
OCR Adapter
      ↓
OCR Result (page + blocks)
      ↓
Evidence Extraction
      ↓
Evidence Candidates
      ↓
Document Evidence Store
      ↓
Health Timeline / MedBridge
```

## Provenance contract

Every extracted item retains:

- resource_id
- source page
- source text
- optional bounding region
- OCR confidence
- processor identity/version
- verification_status = source_extracted

## Care pathway

Extraction does not assume Allopathy. Evidence can be classified as:

- allopathy
- ayush
- mixed
- unknown

Classification should be explicit and reviewable.

## Safety

OCR is an extraction layer, not a diagnostic layer. Uncertain text remains uncertain and is never silently promoted to clinician-confirmed evidence.