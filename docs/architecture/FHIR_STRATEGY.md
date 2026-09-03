# SETU FHIR Strategy

## Position

FHIR R4 conversion is part of the production roadmap.

PRISM will not convert raw OCR text directly into trusted FHIR records. The sequence is:

```
Resource → OCR → Canonical Evidence → validation/review → FHIR projection
```

## Why canonical-first

The same evidence feeds PRISM and MedBridge even when no external FHIR exchange is available. Provenance, confidence and patient-upload origin must not disappear during conversion.

## Provenance

FHIR projections retain references to originating PRISM resources through extensions and source pointers.

## Future layers

- terminology normalization
- LOINC for laboratory observations
- SNOMED CT / ICD-compatible diagnosis coding where legally/licensing appropriate
- RxNorm or India-appropriate medication terminology strategy
- FHIR Bundle export
- ABDM-compatible integration adapter
- consent-aware exchange

FHIR conversion therefore remains a first-class line of work, not a future afterthought.