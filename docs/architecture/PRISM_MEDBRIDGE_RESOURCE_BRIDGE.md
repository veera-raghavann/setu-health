# PRISM → MedBridge Resource Bridge

## Principle

A patient's health resources collected inside PRISM may become available to a clinician through MedBridge only within an authorized clinical access context.

PRISM is the patient-side health workspace.
MedBridge is the clinician-side reconciliation workspace.

They operate over a shared evidence model, but neither grants the other unrestricted access.

## Access flow

```
Patient PRISM Resource
        │
        ▼
Evidence + provenance metadata
        │
        ▼
Authorized access / consent context
        │
        ▼
MedBridge Evidence Resolver
        │
        ├── original document
        ├── processed derivative
        └── extracted evidence
        │
        ▼
Doctor split-view
```

## Doctor view

MedBridge can expose:

1. Original patient-uploaded file.
2. Processed OCR resource.
3. Extracted structured evidence.
4. Exact page/region citations.

The clinician must always be able to distinguish:

- Patient uploaded
- OCR extracted
- ABDM exchanged
- Clinician confirmed

## Consent boundary

PRISM resources are not automatically public to every MedBridge doctor.

Future production access requires:

- authenticated clinician identity
- patient identity match
- valid purpose/access context
- explicit patient authorization or legally valid care context
- time-bounded access session
- immutable audit event

## Reconciliation

OCR-derived evidence enters MedBridge as evidence, not as verified clinical fact.

AI reconciliation must preserve:

```
source_type = uploaded_document
verification_status = source_extracted
resource_id = originating resource
```

A conflict detected using OCR evidence must cite the underlying document resource.