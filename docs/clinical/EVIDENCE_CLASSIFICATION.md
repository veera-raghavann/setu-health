# Evidence Classification Guide

Every clinical fact in SETU must preserve four independent dimensions.

## 1. Clinical pathway

- `allopathic`
- `ayush`
- `cross_cutting`
- `unknown`

## 2. Source class

- `patient_reported`
- `patient_provided_document`
- `abdm_exchange`
- `clinician_confirmed`
- `system_derived`
- `unknown`

## 3. Verification state

Verification describes what actually happened to the evidence. It does not convert an extracted or imported record into clinical truth.

Examples:

- Voice statement → `patient_reported`
- OCR extraction → `extracted_from_document`
- Consented ABDM/FHIR import → `abdm_exchange`
- Explicit clinician review → `clinician_confirmed`

## 4. Resource origin

Every evidence item must point to at least one supporting resource:

- conversation turn
- touch response
- document/page/region
- FHIR resource
- clinician review
- system process

## Important distinction

`abdm_exchange` means the record entered through the applicable consented interoperability path. It does not mean the present clinician has verified the medical fact.

Likewise, `patient_reported` preserves the patient's own account and must not be overwritten by a conflicting imported record. Reconciliation compares evidence; it does not erase origins.
