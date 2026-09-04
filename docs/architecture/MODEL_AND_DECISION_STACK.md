# PRISM Model and Decision Stack

## The honest current state

PRISM does not currently use an LLM to decide clinical next questions.

That is intentional at this stage.

## Active stack

```
Voice
  → BHASHINI Streaming STT
Text / Touch
  → direct normalization

All modalities
  → Conversation Turn

Conversation Turn
  → Deterministic Red-Flag Gate
  → Deterministic Intake Protocol
  → Structured nextAction
  → UI
```

## Engines currently in code

### 1. BHASHINI

Model/provider layer for speech recognition.

Input: 16 kHz mono linear16 PCM.

Output: interim/final transcript.

### 2. Red-flag rules

`screenRedFlags()`

Purpose: detect obvious emergency signals before routine intake continues.

Authority: hard gate.

### 3. Protocol engine

`questionsFor()`

Purpose: determine the next missing structured information.

Current baseline fields:

- onset
- progression
- associated symptoms
- severity

### 4. UI trigger contract

```json
{
  "type": "ASK | TRIAGE_ALERT | COMPLETE_SECTION",
  "patient_text": "...",
  "input_mode": "BOTH | NONE",
  "options": []
}
```

The frontend does not invent clinical flow. It renders the backend decision.

## Decision trace

Each significant transition is stored in `clinicalContext.decisionTrace`.

This lets us later answer:

- why was this question asked?
- which engine made the decision?
- which safety rule triggered?
- what happened before the UI changed?

## Planned intelligence layer

The future architecture is:

```
Hard safety rules
        ↓
Structured protocol constraints
        ↓
LLM conversation intelligence
        ↓
Structured decision validator
        ↓
nextAction
```

The LLM will be constrained to a typed output contract.

It may interpret free text and map it to structured fields, but it must not autonomously become the safety authority.

## Model selection is deliberately not hardcoded

A provider adapter will be introduced rather than coupling PRISM to one vendor.

Candidate classes:

- lightweight reasoning model for real-time intake
- larger model for clinician-facing summarization
- embedding model for longitudinal retrieval

The exact provider/model should be chosen only after we benchmark latency, Indian-language handling, cost, structured-output reliability and clinical safety on our PRISM evaluation set.