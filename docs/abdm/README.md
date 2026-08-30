# ABDM / ABHA / FHIR Integration

This directory contains integration specifications and verified notes for SETU's interoperability layer.

## Rules

- Treat the current NHA/ABDM documentation and sandbox contracts as authoritative.
- Do not hard-code undocumented endpoint assumptions into the product architecture.
- Keep ABDM-specific implementation behind adapters.
- Distinguish ABHA identity from consent and from health-information exchange.
- Do not assume every ABHA holder has accessible records.
- Use synthetic/test data for repository fixtures.
- Record the version/date of any external API contract used by the implementation.

## Planned areas

- identity / ABHA adapter
- consent lifecycle
- HIU exchange adapter
- HIP test adapter where needed for controlled demos
- FHIR R4 parsing/validation
- terminology mapping
- provenance and source references
- HIS/EMR adapter strategy
