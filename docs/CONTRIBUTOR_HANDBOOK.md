# SETU — Collaborator Handbook

> **Purpose:** Give every collaborator a clear start-to-finish walkthrough of the `setu-health` repository: where to work, what each folder means, how work moves through GitHub, and how to safely contribute.
>
> **Project:** SETU · SIH 2026 · PS 26047 — Patient Case-Taking Software · Team Ektara

---

## 1. What is SETU?

SETU is the product we are building for the SIH problem statement. It prepares trustworthy clinical context before a consultation by combining patient-provided history, medical documents, consented interoperable health information, and clinical reconciliation.

The product path is:

```text
Patient
  ↓
Identity / ABHA context + Consent
  ↓
Language & Accessibility
  ↓
PRISM — patient intake & clinical history
  ├── Voice / ASR
  ├── Touch
  ├── Allopathic history
  ├── AYUSH history
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
  ↓
Cited physician-ready case sheet
  ↓
Physician review / correction / confirmation
  ↓
HIS / EMR workflow
```

**PRISM is our current first engineering workstream.** The OCR, ASR/Bhashini and patient-client tracks are not separate products. They are parts of the same PRISM pipeline.

---

## 2. Golden rule before you touch the repo

**Understand the path before writing code.**

Every feature should answer four questions:

1. Where does this fit in the SETU patient journey?
2. What data does it receive?
3. What agreed data shape does it produce?
4. Which downstream module consumes that output?

Do not build an isolated demo that cannot connect to the shared system.

---

## 3. Repository map

```text
setu-health/
│
├── apps/
│   └── patient/
│
├── services/
│   ├── prism/
│   │   ├── intake/
│   │   ├── conversation/
│   │   ├── asr/
│   │   ├── ocr/
│   │   ├── clinical-history/
│   │   ├── ayush/
│   │   └── safety/
│   │
│   ├── medbridge/
│   └── abdm/
│
├── packages/
│   └── clinical-schema/
│
├── docs/
│   ├── architecture/
│   ├── clinical/
│   ├── abdm/
│   ├── research/
│   └── decisions/
│
├── infrastructure/
├── tests/
│
├── .github/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

### `apps/`

User-facing applications live here.

`apps/patient/` is the patient-facing client. This is where the patient experience belongs: language selection, accessibility, voice/touch interaction, document capture, consent presentation, progress, and other client-side flows.

**Do not put clinical business rules or ABDM secrets in the client.** The client calls the appropriate backend/service interfaces.

### `services/`

This is the main product logic layer. Services represent product domains, not individual people.

#### `services/prism/`

PRISM owns patient intake and clinical history acquisition.

- `intake/` — session lifecycle, patient intake orchestration, input collection
- `conversation/` — conversational flow, question/answer orchestration, dialogue state
- `asr/` — ASR adapters and Indian-language speech processing; Bhashini research/implementation belongs here
- `ocr/` — medical-document capture/processing adapters and OCR pipeline
- `clinical-history/` — structured allopathic history assembly and history-section logic
- `ayush/` — AYUSH-specific history pathway and its clinical data structures
- `safety/` — deterministic safety/red-flag checks and escalation signals

PRISM should produce structured evidence rather than a final diagnosis.

#### `services/medbridge/`

MedBridge is the clinical reconciliation/intelligence layer.

It consumes evidence produced or retrieved elsewhere and performs cross-source reconciliation, conflict/gap detection, evidence-grounded summarisation and clinical-query support.

Do not make PRISM depend directly on MedBridge internals. Connect them through shared contracts/interfaces.

#### `services/abdm/`

ABDM/ABHA/FHIR integration adapters belong here.

This layer isolates external ecosystem details from the rest of the application. Do not scatter ABDM calls throughout the patient app or PRISM modules.

**Important:** Do not invent or assume production ABDM endpoints. Sandbox contracts and current official specifications must be verified before implementation or documentation is presented as production-ready.

---

## 4. `packages/clinical-schema/`

This is one of the most important folders in the repository.

It contains the shared clinical data contracts used between PRISM modules and later MedBridge integration.

The contract exists so that:

```text
ASR ──────┐
OCR ──────┤
Touch ────┼──→ shared clinical evidence → MedBridge
History ──┤
AYUSH ────┘
```

All contributors must use the shared contract instead of inventing incompatible JSON shapes for their own module.

### Evidence must retain provenance

A clinically relevant item should preserve, where applicable:

- original value
- structured/normalized value
- source type
- capture method
- confidence
- clinical certainty
- status
- event date
- ingestion/capture date
- source facility/document/resource
- source locator

**Confidence and clinical certainty are different concepts.** A speech recognizer can be 96% confident about the transcription while the patient's clinical statement can still be uncertain.

Similarly, OCR extraction must not be treated as clinician-confirmed truth merely because text was extracted successfully.

---

## 5. `docs/`

Documentation is part of the engineering work.

### `docs/architecture/`

System diagrams, service boundaries, data flow, integration boundaries and technical architecture.

If you change how two services communicate, update the relevant architecture documentation.

### `docs/clinical/`

Clinical workflow, history structures, AYUSH pathways, safety boundaries and terminology decisions.

Clinical logic should be documented here before becoming complicated code.

### `docs/abdm/`

ABHA, ABDM, HIP/HIU, consent, FHIR and interoperability research.

Only verified information should be stated as an implementation fact. Mark research assumptions clearly.

### `docs/research/`

Research tracks such as:

- OCR benchmarking
- Bhashini/ASR benchmarking
- Flutter vs React Native evaluation
- multilingual support
- document preprocessing
- model/service comparisons

Research notes should end with a practical recommendation or decision when the research is complete.

### `docs/decisions/`

Architecture Decision Records (ADRs) for decisions that affect the whole repository.

Examples:

- client framework selection
- ASR provider/model selection
- OCR architecture selection
- terminology strategy
- evidence-contract changes

Do not create an ADR for every small coding choice.

---

## 6. `infrastructure/`

Deployment, runtime configuration and infrastructure definitions belong here.

Never commit secrets. Use environment variables and documented configuration templates.

`.env.example` contains names/placeholders only. Real `.env` files stay local and must never be committed.

---

## 7. `tests/`

Cross-module and integration tests belong here.

Module-specific unit tests should stay close to their module where the chosen framework supports that convention.

We especially need tests for:

- shared schema validation
- ASR/OCR output mapping
- clinical-history assembly
- AYUSH pathway routing
- red-flag detection
- provenance preservation
- consent/access boundaries
- reconciliation inputs/outputs
- end-to-end patient flows

---

## 8. `.github/`

Repository automation belongs here, including CI workflows when introduced.

CI should eventually verify formatting, type checking, tests, schema validation, security checks and build integrity before changes are merged.

---

# 9. Your first day as a collaborator

### Step 1 — Get the repository

Clone the repository and enter it.

```bash
git clone https://github.com/veera-raghavann/setu-health.git
cd setu-health
```

### Step 2 — Start from current `main`

```bash
git checkout main
git pull origin main
```

Never start a new task from an old local branch.

### Step 3 — Read these first

1. `README.md`
2. `docs/CONTRIBUTOR_HANDBOOK.md`
3. relevant architecture documentation
4. the GitHub issue assigned to you
5. relevant clinical/research documentation

### Step 4 — Understand your task

If your issue is **PRISM-002 — OCR**, your primary area is:

```text
services/prism/ocr/
docs/research/
packages/clinical-schema/
tests/
```

If your issue is **PRISM-003 — ASR/Bhashini**:

```text
services/prism/asr/
docs/research/
packages/clinical-schema/
tests/
```

If your issue is **PRISM-004 — Flutter/React Native**:

```text
apps/patient/
docs/research/
packages/clinical-schema/
tests/
```

The exact issue scope always wins over this example.

---

# 10. How we work on an issue

We keep Git simple.

```text
GitHub Issue
     ↓
PRISM-00X branch
     ↓
work + commits
     ↓
local testing
     ↓
push branch
     ↓
Pull Request → main
     ↓
review
     ↓
merge
     ↓
delete branch
```

### One issue = one branch

Use the issue name/number as the branch name where practical:

```text
PRISM-001
PRISM-002
PRISM-003
PRISM-004
```

Do **not** create unnecessary branch layers such as:

```text
foundation/...
contract/...
feature/...
research/...
contract-v0/...
```

unless the team later has a concrete reason to introduce them.

---

# 11. If multiple people are working on one issue

They can work on the **same issue branch** when the work belongs to one integrated task.

Example:

```text
PRISM-001
   ├── contributor A
   ├── contributor B
   └── contributor C
             ↓
       integration/testing
             ↓
        PRISM-001 → main
```

Coordinate file ownership before editing the same files.

If two people need to make changes in the same file, communicate first to avoid unnecessary merge conflicts.

---

# 12. Commit rules

Keep commits small and understandable.

Good:

```text
prism: add OCR result mapping
prism: add Bhashini ASR adapter interface
patient: add language selection screen
schema: add document evidence fields
test: validate clinical evidence provenance
```

Avoid:

```text
updates
changes
final
final2
stuff
working
```

### A commit should represent one logical change.

Do not mix unrelated formatting, refactors and features into one commit unless they genuinely belong together.

---

# 13. Before pushing

Run the checks relevant to your module.

At minimum:

```bash
git status
git diff
```

Then run the project's configured formatter, type checker, linter and tests as applicable.

Before pushing, make sure:

- no secrets are present
- no patient/health data is present
- no API keys or certificates are committed
- no vendor credentials are hardcoded
- the shared contract is respected
- documentation is updated if behaviour/architecture changed

---

# 14. Pull Request rules

Open a PR from your task branch into `main`.

PR title should be clear:

```text
PRISM-002: Add OCR research and adapter foundation
```

PR description should answer:

### What changed?
Short summary.

### Why?
Link to the GitHub issue and explain the problem being solved.

### How?
Brief technical explanation.

### Testing
List what was actually tested.

### Screenshots / recordings
Include them when UI or user interaction changed.

### Notes / limitations
Mention research assumptions, mock integrations, sandbox-only behaviour, known limitations or follow-up work.

Never claim a prototype, mock, sandbox integration or research result is production-certified when it is not.

---

# 15. Review checklist

Before approving a PR, check:

### Product
- Does it belong in the SETU patient-to-physician journey?
- Does it solve the assigned issue?

### Clinical
- Does it preserve clinical meaning and provenance?
- Does it avoid presenting AI inference as diagnosis?
- Are safety-sensitive behaviours deterministic and reviewable?
- Does it respect both allopathic and AYUSH pathways where relevant?

### Technical
- Does it use shared contracts?
- Are service boundaries respected?
- Are external integrations isolated behind adapters?
- Are errors handled?
- Are tests present?

### Security
- Any secrets?
- Any real patient data?
- Any unnecessary data retention?
- Any client-side credentials that should be server-side?

### Documentation
- Is the relevant documentation updated?
- Is a major architectural decision documented?

---

# 16. Special instructions for the three current research tracks

## OCR track

Your goal is not merely to answer “which OCR is best?”

Evaluate the complete medical-document pipeline:

```text
image/document
   ↓
preprocessing
   ↓
OCR
   ↓
layout/document understanding
   ↓
clinical entity extraction
   ↓
normalisation
   ↓
confidence + provenance
   ↓
shared clinical evidence
```

Benchmark realistic inputs: printed reports, prescriptions, handwritten material, multilingual documents, poor scans and photographs.

The output of your work must be usable by `services/prism/ocr/` and compatible with the shared clinical evidence contract.

## ASR / Bhashini track

Your goal is not merely to test speech-to-text accuracy.

Evaluate:

- supported Indian languages
- accents/dialects where relevant
- noisy hospital environments
- latency
- streaming vs batch behaviour
- punctuation/segmentation
- medical terminology handling
- confidence information
- privacy/deployment implications
- integration/API constraints

The output must feed the clinical conversation layer without creating a vendor lock-in.

## Flutter / React Native track

Evaluate the patient experience, not just framework popularity.

Consider:

- kiosk/tablet suitability
- accessibility
- microphone/camera permissions
- offline/degraded-network behaviour
- multilingual UI
- touch targets
- voice-first interaction
- document capture
- secure session handling
- maintainability
- Android/iOS requirements
- integration with PRISM services

The final client must consume shared contracts rather than duplicate backend clinical logic.

---

# 17. Clinical safety rules for contributors

SETU assists clinicians. It does not replace them.

### Never do this

```text
LLM → diagnosis → patient
```

### Prefer this

```text
Evidence
   ↓
Rules + bounded AI
   ↓
Structured finding
   ↓
Source/provenance
   ↓
Physician review
```

AI-generated summaries are drafts. Safety-sensitive flags must be explainable and reviewable.

A red-flag engine may escalate a patient to staff; it must not pretend to provide a definitive diagnosis.

---

# 18. AYUSH is first-class

Do not treat AYUSH as a future checkbox.

The PS explicitly requires AYUSH-specific history, so AYUSH belongs in the core architecture.

The product should support an appropriate clinical pathway such as:

```text
Clinical pathway
      │
 ┌────┴────┐
 ↓         ↓
Allopathic AYUSH
 history   history
```

The exact clinical questionnaire/content must be validated against appropriate clinical sources and domain experts before production use.

Do not invent clinical rules merely to make a demo look complete.

---

# 19. ABDM / ABHA rules

ABHA provides identity/context within the ABDM ecosystem. It is not itself a central medical-record database.

ABDM interoperability should remain standards-based and consent-driven.

Keep ecosystem-specific implementation details inside `services/abdm/` and `docs/abdm/`.

Do not hardcode assumptions about:

- production endpoint URLs
- authentication credentials
- consent semantics
- certification status
- HIP/HIU capabilities

Verify current official specifications before calling something production behaviour.

Sandbox/demo data must be clearly labelled as such.

---

# 20. Research vs implementation

Research is valuable, but the repository should make the transition clear.

### Research result

Lives primarily in:

```text
docs/research/
```

### Selected implementation

Lives in the appropriate `apps/`, `services/` or `packages/` directory.

### Decision affecting the whole system

Document in:

```text
docs/decisions/
```

A research document should not quietly become the production architecture without an explicit decision.

---

# 21. What not to commit

**Never commit:**

- API keys
- passwords
- access tokens
- private certificates
- `.env` files containing secrets
- real patient data
- real medical documents
- production database dumps
- personal health information
- unapproved proprietary datasets

Use synthetic/demo data for development.

If you accidentally expose a secret, do not simply delete the line and assume the secret is safe. Report it immediately so it can be revoked/rotated.

See `SECURITY.md`.

---

# 22. When you are stuck

Follow this order:

1. Read the assigned issue.
2. Search the repository for an existing implementation/pattern.
3. Read the relevant architecture/clinical/research documentation.
4. Check the shared clinical schema.
5. Ask in the team discussion/issue before creating a parallel architecture.
6. If the decision affects multiple modules, document it before implementing it.

**Do not create a second solution just because you did not find the first one.** Ask first.

---

# 23. Definition of Done

A task is not done merely because the code runs on one laptop.

A PRISM task is ready for PR when:

- the issue's acceptance criteria are addressed
- code is in the correct repository area
- shared contracts are respected
- tests relevant to the change pass
- no secrets or real health data are included
- documentation/research is updated where needed
- limitations are clearly stated
- another team member can understand what changed

---

# 24. Our current PRISM sequence

The initial workstream is intentionally simple:

```text
PRISM-001
Clinical Evidence Contract
        ↓
PRISM-002
OCR
        ↓
PRISM-003
ASR / Bhashini
        ↓
PRISM-004
Patient Client — Flutter / React Native
        ↓
Clinical History Engine
        ↓
AYUSH Pathway
        ↓
Safety / Red-Flag Gate
        ↓
ABDM / FHIR Integration
        ↓
MedBridge Reconciliation
        ↓
End-to-End SETU
```

Some work can happen in parallel. The sequence above describes the integration dependency, not a requirement that every person wait for the previous issue to finish.

---

# 25. The one sentence every collaborator should remember

> **We are not building OCR, ASR, an app, or an AI chatbot separately. We are building SETU, and every component must connect to the same patient-to-physician clinical journey.**

---

## Quick reference

| If you are working on... | Start here |
|---|---|
| Patient UI | `apps/patient/` |
| PRISM intake | `services/prism/intake/` |
| Conversation | `services/prism/conversation/` |
| Bhashini / ASR | `services/prism/asr/` |
| OCR | `services/prism/ocr/` |
| Allopathic history | `services/prism/clinical-history/` |
| AYUSH | `services/prism/ayush/` |
| Safety | `services/prism/safety/` |
| Reconciliation | `services/medbridge/` |
| ABDM / ABHA / FHIR | `services/abdm/` |
| Shared data structures | `packages/clinical-schema/` |
| Architecture | `docs/architecture/` |
| Clinical decisions | `docs/clinical/` |
| ABDM research | `docs/abdm/` |
| Technology research | `docs/research/` |
| Major architecture decisions | `docs/decisions/` |
| Cross-module tests | `tests/` |
| Deployment | `infrastructure/` |

**Welcome to SETU. Build your piece, understand the whole bridge, and keep the contract intact.**
