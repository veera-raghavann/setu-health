# ABDM Adapter Layer

This service isolates SETU from external ABDM/ABHA/FHIR contracts.

Planned adapters:

- identity / ABHA context
- consent lifecycle
- HIU health-information exchange
- controlled HIP test/demo integration
- FHIR validation and parsing

External API contracts must be verified against the current official ABDM/NHA sandbox documentation before implementation. No undocumented endpoint, header or certificate assumption belongs in core business logic.
