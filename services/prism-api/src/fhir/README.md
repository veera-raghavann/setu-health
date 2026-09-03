# PRISM FHIR Projection

FHIR conversion is explicitly on the PRISM roadmap and now has a projection layer.

## Critical rule

PRISM's provenance-aware evidence model is canonical.

FHIR is an interoperability projection, not the only source of truth.

```
Original resource
  ↓
OCR / extraction
  ↓
Canonical ClinicalEvidence
  ├── PRISM timeline
  ├── MedBridge reconciliation
  └── FHIR R4 projection
```

## Initial mapping

| PRISM category | FHIR R4 |
|---|---|
| allergy | AllergyIntolerance |
| medication | MedicationStatement |
| diagnosis | Condition |
| lab_result | Observation |
| vital | Observation |
| immunization | Immunization |
| discharge_summary | DocumentReference |
| procedure | Procedure |

Raw source documents remain represented separately from structured projections.