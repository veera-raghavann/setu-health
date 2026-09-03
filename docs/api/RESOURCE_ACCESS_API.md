# Resource Access API

## Create clinician grant

POST /v1/resources/:id/access-grants

Required operational context:

- patient_id
- access_session_id
- purpose
- consent_reference when applicable

Default expiry is 30 minutes.

## Resolve from MedBridge

POST /v1/medbridge/resources/:id/resolve

The request is denied unless an active grant matches the clinical access session.

## Revoke

DELETE /v1/resource-access-grants/:grantId

All decisions generate audit events in the current audit abstraction.