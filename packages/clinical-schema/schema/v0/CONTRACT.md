# PRISM Clinical Evidence Contract v0

## Purpose

This contract defines the smallest shared representation of a clinical fact that can move between PRISM intake, ASR/NLU, OCR/document intelligence, ABDM/FHIR adapters, clinical history pathways, and MedBridge reconciliation.

The contract is intentionally **evidence-first**. A downstream service must be able to answer: **what was said or extracted, how it was obtained, what it was normalized to, how confident the system is, and where it came from.**

## Required semantics

Every evidence item has:

- `id` — local stable identifier.
- `kind` — clinical concept type. Keep this vocabulary controlled by the clinical-schema package; do not invent vendor-specific shapes.
- `source` — `patient`, `document`, `fhir`, `clinician`, or `system`.
- `captureMethod` — `voice`, `touch`, `ocr`, `fhir`, `manual`, or `derived`.
- `value` — structured value consumed by downstream services.
- `provenance` — source identity and ingestion/event context.

## Provenance is mandatory

Clinical evidence must never be detached from its origin.

For example, these are different evidence items even when their normalized concept is identical:

1. A patient reports an allergy during PRISM voice intake.
2. A discharge summary contains an allergy extracted by OCR.
3. An ABDM/FHIR record contains an allergy resource.
4. A clinician manually confirms the allergy.

MedBridge may later reconcile them, but PRISM must preserve the distinction.

## Original vs normalized value

`originalValue` preserves the source representation. `value` is the structured value used by the pipeline. `normalized` is optional and records a terminology mapping when one has been established.

A failed or uncertain normalization must not overwrite the original evidence.

## Confidence vs certainty

These are deliberately separate:

- `confidence` answers: **How confident is the system that it captured/extracted this correctly?**
- `certainty` answers: **How definite is the underlying clinical claim?**

A patient can confidently say that they are unsure whether they had a reaction; that should not become a clinically certain allergy merely because ASR confidence is high.

## Dates

- `provenance.eventDate` is when the clinical event/evidence refers to.
- `provenance.ingestedAt` is when SETU received the evidence.

They must not be conflated. Historical records frequently arrive long after the clinical event.

## Source priority

The schema intentionally does **not** define a universal source-of-truth ranking. Reconciliation requires clinical context and provenance. A later clinician-confirmed entry may matter differently from a patient-reported statement or an old OCR extraction.

## Safety boundary

Evidence is not a diagnosis and is not a clinical decision. PRISM records and structures information; safety gates can escalate red flags; downstream clinical services may surface conflicts. Final clinical decisions remain with the clinician.

## Compatibility rule

Changes to required fields, enums, provenance semantics, or the meaning of an existing field are breaking changes and require a new schema version or an explicitly reviewed compatibility decision.

Research adapters may add internal fields, but the output crossing the PRISM boundary must conform to this contract.
