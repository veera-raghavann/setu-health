# PRISM API

Initial backend spine for the patient intake product.

Current endpoints:
- POST /v1/intake/sessions
- POST /v1/intake/sessions/:id/responses
- GET /health

The current store is in-memory for development only. The next persistence milestone moves session, patient, evidence and document metadata into PostgreSQL. Clinical protocols and red-flag rules remain deterministic and clinician-reviewed.