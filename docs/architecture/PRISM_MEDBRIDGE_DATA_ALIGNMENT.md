# PRISM ↔ MedBridge Data Alignment

## Why this exists

PRISM is the ingestion and patient-side health memory layer. MedBridge consumes longitudinal evidence for reconciliation and clinical queries.

Therefore PRISM storage must produce the same clinically meaningful categories MedBridge uses, while retaining richer provenance.

## Canonical categories

1. Allergy records
2. Medication records
3. Diagnosis records
4. Laboratory results
5. Vital records
6. Immunization records
7. Discharge summaries
8. Procedures
9. Clinical notes
10. Unknown / review required

## Required evidence envelope

Every PRISM extracted item stores:

- category
- normalized clinical payload
- patient ID
- occurred/recorded time
- source class
- verification status
- care pathway
- one or more source pointers
- original resource ID
- processed resource ID when applicable
- page/region/text provenance
- extraction confidence
- FHIR projection state

## MedBridge consumption

MedBridge should consume evidence through the canonical envelope, not directly scrape OCR tables.

This enables:

- stacked reconciliation view
- split-view source inspection
- conflict comparison
- source document filters
- clinical query citations

## Source-document filters

PRISM should support MedBridge-style filtering by category and expose the underlying documents for every category.

## Safety

An OCR-extracted record can participate in reconciliation but remains source_extracted until independently confirmed. AI must surface the source and uncertainty.