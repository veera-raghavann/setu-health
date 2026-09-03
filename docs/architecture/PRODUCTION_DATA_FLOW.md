# Production Data Flow

```
Patient
  │ upload / voice / touch
  ▼
PRISM API
  │
  ├─ store original immutable resource
  ├─ create processing run
  ▼
Specialized worker
  │ OCR / ASR
  ▼
Canonical ClinicalEvidence
  │ provenance + confidence + pathway + verification
  ├───────────────┬─────────────────┐
  ▼               ▼                 ▼
Patient timeline  MedBridge          FHIR R4 Bundle
                  clinical view      interoperability
```

## Canonical storage rule

ClinicalEvidence is the shared semantic layer. No downstream service reads OCR text as its primary clinical model.

## Original resource rule

Original patient files remain immutable and addressable. Derived resources and evidence point back through lineage.

## FHIR rule

FHIR is generated from canonical evidence. It never erases PRISM provenance.