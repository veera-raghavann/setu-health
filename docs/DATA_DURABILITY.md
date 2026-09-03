# PRISM Data Durability

## Development mode

Without `DATABASE_URL`, PRISM intentionally uses in-memory session/resource metadata. This mode is only for local development.

## Persistent mode

With PostgreSQL configured:

- Patient identifiers are registered before dependent session/resource writes.
- Intake sessions persist in `intake_sessions`.
- Original and processed resource metadata persist in `resources`.
- Resource binaries persist through the configured binary store path.
- Extracted evidence persists in `document_evidence`.
- Source provenance retains the original resource relationship.

The patient web app's locally generated UUID is therefore accepted as a PRISM prototype identity and registered in the local patient table before dependent records are created.

## Important boundary

This prototype identity bootstrap is not an ABDM identity implementation. ABHA/ABDM identity linkage must enter through the approved consented integration path.
