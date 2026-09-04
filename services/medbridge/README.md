# MedBridge

MedBridge is SETU's longitudinal clinical evidence and reconciliation layer.

## Integrated architecture

MedBridge now reads from the shared SETU patient pool instead of an isolated Base44 datastore:

- ABHA-style patient identity is established through the SETU OTP flow.
- PRISM patient intake contributes current health issues.
- Patient-uploaded records are retained in the same patient context.
- PRISM OCR/document evidence remains source-aware and can be exposed through consented access grants.
- Hospital-linked demo records are preserved for the hackathon demonstration and are explicitly represented as demo data.
- MedBridge access is protected by a separate doctor-to-patient consent OTP and a short-lived access session.

## Current API

- `POST /v1/medbridge/consent/request`
- `POST /v1/medbridge/consent/verify`
- `GET /v1/medbridge/sessions/:id/context`
- `POST /v1/medbridge/sessions/:id/reconcile`
- `GET /v1/medbridge/patients/:healthId/context`

MedBridge does not make the final clinical decision. Physician review remains part of the workflow.
