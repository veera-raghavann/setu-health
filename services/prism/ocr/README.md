# PRISM OCR / Document Intelligence

Document processing is an adapter boundary. Candidate OCR and document-understanding systems are evaluated against Indian clinical documents before production adoption.

The output must preserve:

- source document identifier
- page/region provenance when available
- extracted text
- structured clinical entities
- confidence/uncertainty
- event date vs ingestion date

Low-confidence handwriting, ambiguous units and uncertain medication names must remain reviewable by a human.
