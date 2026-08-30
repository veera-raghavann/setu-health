# Clinical Evidence Schema v0

This directory contains the versioned JSON Schema and examples for the PRISM clinical evidence boundary.

## Files

- `clinical-evidence.schema.json` — normative schema.
- `CONTRACT.md` — semantic contract and engineering rules.
- `examples/clinical-evidence.examples.json` — representative examples from voice, touch, OCR and FHIR sources.

## Producers

- PRISM patient intake
- ASR / NLU adapters
- OCR / document intelligence
- clinician input
- ABDM / FHIR adapters

## Consumers

- clinical history structuring
- safety/red-flag services
- clinical timeline
- MedBridge reconciliation
- physician-facing evidence views

## Important

The schema is a **transport/evidence contract**, not a complete patient record model and not a FHIR replacement. FHIR resources remain authoritative for interoperable source records. This contract gives SETU a common provenance-preserving representation across heterogeneous inputs.
