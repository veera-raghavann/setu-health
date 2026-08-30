# SETU

**SETU — a clinical continuity platform for multilingual patient intake, clinical history, medical-document intelligence, consented health-information exchange, and evidence-grounded clinical reconciliation.**

> SIH 2026 · Problem Statement 26047 · Patient Case-Taking Software
>
> Team Ektara · Production repository

## Why SETU

SETU prepares a trustworthy clinical context **before the consultation**. A patient can identify themselves, choose a language and accessibility mode, provide history through voice or touch, capture prior medical documents, and—where available and appropriately consented—bring together interoperable health information. The system structures, reconciles, cites, and presents that evidence to the clinician for review.

SETU supports **both allopathic and AYUSH clinical pathways**. It is designed to assist clinicians, not replace clinical judgment.

## Product architecture

```text
Patient
  ↓
Identity / ABHA context + Consent
  ↓
Language & Accessibility
  ↓
PRISM — Patient intake & clinical history
  ├── Voice / ASR
  ├── Touch interaction
  ├── Allopathic pathway
  ├── AYUSH pathway
  └── Safety / red-flag gate
  ↓
Medical Document Intelligence
  ├── Capture
  ├── OCR
  ├── Extraction
  └── Provenance
  ↓
ABDM / FHIR interoperability
  ↓
Clinical evidence + timeline
  ↓
MedBridge reconciliation
  ├── Deterministic safety rules
  ├── Cross-source reconciliation
  ├── Conflict / gap detection
  └── Evidence-grounded AI
  ↓
Cited physician-ready case sheet
  ↓
Physician review / correction / confirmation
  ↓
HIS / EMR workflow
```

## Repository structure

```text
apps/           User-facing clients
services/       Domain services and adapters
packages/       Shared types, schemas, terminology and UI primitives
docs/           Architecture, clinical, ABDM and research documentation
infrastructure/ Deployment and environment configuration
tests/          Cross-service and integration tests
```

## Current engineering focus: PRISM

PRISM is the first production workstream. Its boundaries are deliberately defined so that OCR, Indian-language ASR, and the patient client can be developed independently and then converge on one shared clinical evidence contract.

### PRISM shared contract

The shared contract covers the concepts required to move evidence through the PRISM pipeline:

- `Patient`
- `Session`
- `Language`
- `ConsentContext`
- `ConversationTurn`
- `ClinicalResponse`
- `Document`
- `OCRResult`
- `ClinicalEntity`
- `HistorySection`
- `SafetyFlag`
- `Evidence`

The contract is an **engineering interface**, not a separate project or branch. All PRISM contributors build against the same interface.

## Team Git workflow

Keep the workflow simple:

```text
PRISM-001 branch
      ↓
team members work on the task
      ↓
integration + testing
      ↓
pull request → main
      ↓
review + merge
      ↓
delete PRISM-001 branch
```

Use **one branch per PRISM issue**. Do not create extra branch layers such as `foundation/...`, `contract/...`, or `v0/...` unless the team later has a concrete reason to do so.

## Engineering principles

1. **Clinical workflow first.** Technology serves the clinical journey.
2. **AI is bounded.** Generative models do not control consent, access, emergency escalation, or final clinical decisions.
3. **Evidence over assertion.** Material clinical statements must retain provenance.
4. **Patient choice.** Voice and touch are peer interaction modes.
5. **AYUSH is first-class.** AYUSH-specific clinical history is not an afterthought.
6. **Interoperability by design.** External healthcare systems are accessed through adapters and standards-based contracts.
7. **Privacy by design.** Minimum necessary data, short-lived access, explicit consent, RBAC, encryption and auditability.
8. **Prototype ≠ production.** Sandbox/test integrations and demo data must never be represented as production certification.

## Development status

This repository is the production engineering foundation. The existing MedBridge prototype and research work inform the architecture; they will be integrated through deliberate, reviewed modules rather than copied wholesale into the production codebase.

## Documentation

- `docs/architecture/` — system and service architecture
- `docs/clinical/` — clinical workflow and safety boundaries
- `docs/abdm/` — ABDM / ABHA / FHIR integration notes
- `docs/research/` — OCR, ASR, mobile/client and evidence research
- `docs/decisions/` — architecture decision records

## Security

Never commit credentials, API keys, certificates, patient data, real health records, or production secrets. See `SECURITY.md`.
