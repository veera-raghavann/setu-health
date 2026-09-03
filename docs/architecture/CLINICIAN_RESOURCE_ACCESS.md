# Clinician Resource Access

## Goal

Allow MedBridge to resolve PRISM patient resources without turning PRISM into an unrestricted document repository.

## Runtime flow

1. A MedBridge clinical access session is established.
2. The relevant patient authorization context exists.
3. PRISM resource access grants are created for required resources.
4. The grant is bound to the MedBridge access session.
5. Clinician requests a resource.
6. PRISM validates resource + patient + active session + expiry.
7. Access decision is audited.
8. The delivery adapter returns an authorized representation.

## Revocation

A grant can be explicitly revoked and naturally expires.

## Important future step

Current implementation contains the authorization domain model and development repository. Production must replace this with PostgreSQL and integrate the actual identity/consent provider before real patient deployment.