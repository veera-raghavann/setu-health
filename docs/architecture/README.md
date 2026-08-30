# SETU Architecture

## System spine

```text
PATIENT
  ↓
Identity / ABHA context + Consent
  ↓
Language + Accessibility
  ↓
PRISM — patient intake & clinical history
  ├─ Voice / ASR
  ├─ Touch
  ├─ Allopathic pathway
  ├─ AYUSH pathway
  └─ Safety / red-flag gate
  ↓
Medical Document Intelligence
  ├─ Capture
  ├─ OCR
  ├─ Extraction
  └─ Provenance
  ↓
ABDM / FHIR interoperability
  ↓
Clinical evidence + timeline
  ↓
MedBridge reconciliation
  ├─ deterministic rules
  ├─ cross-source comparison
  ├─ conflict/gap detection
  └─ evidence-grounded AI
  ↓
Cited physician-ready case sheet
  ↓
Physician review / confirmation
  ↓
HIS / EMR workflow
```

## Service boundaries

### PRISM
Owns patient-facing intake, conversation state, language/accessibility orchestration, clinical history pathways, document intake and safety-gate interfaces.

### MedBridge
Owns longitudinal clinical evidence reconciliation, conflict detection, evidence citations, clinical Q&A and synthesis over trusted evidence.

### ABDM adapter
Owns external identity, consent and health-information exchange contracts. It must isolate changing external APIs from the core domain model.

### Clinical evidence model
The convergence point between PRISM, document intelligence and external FHIR data. Evidence must retain provenance, timestamp, source and uncertainty.

## Safety boundary

Consent, authorization, access control, session expiry, audit and emergency escalation are not delegated to a generative model. AI operates inside explicit schemas and evidence boundaries.

## Data flow principle

Raw source → typed extraction → normalized clinical fact → evidence/provenance → reconciliation → cited synthesis → clinician review.

Do not send arbitrary raw documents or unbounded external records directly to an LLM.
