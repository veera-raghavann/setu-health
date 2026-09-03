# PRISM Evidence API

## Process a resource

POST /v1/resources/:id/process

Runs the configured OCR worker and persists normalized source-extracted evidence.

## List patient evidence

GET /v1/patients/:patientId/evidence

Optional query:

- category

## FHIR export

GET /v1/patients/:patientId/fhir-bundle

Returns a FHIR R4 collection Bundle projected from canonical PRISM evidence.

## Download resource

GET /v1/resources/:id/download

Production deployments must place authorization middleware in front of this endpoint. The current endpoint is development plumbing and must not be exposed unauthenticated.