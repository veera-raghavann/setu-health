# PRISM Data Model

## Core separation

PRISM does not collapse all health information into one trust bucket.

Every evidence item carries:

- source_type
- care_pathway
- verification_status
- resource origin
- source locator

## Trust categories

1. Patient reported
2. Uploaded document extracted
3. ABDM exchanged
4. Clinician confirmed

## Why this matters

A patient's statement, OCR extraction and FHIR resource are different kinds of evidence. The system must preserve that distinction through summarization and physician review.

## Initial tables

- patients
- intake_sessions
- evidence_items

Later bounded aggregates:

- documents
- document_pages
- conversation_turns
- consent_requests
- health_timeline_events
- audit_events
- clinician_reviews