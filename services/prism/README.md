# PRISM

**PRISM is SETU’s patient-facing clinical intake and structured history engine.**

It converts a patient's natural interaction—voice or touch—into structured, provenance-aware clinical evidence that can be combined with medical documents and consented health information.

## Core responsibilities

- intake session lifecycle
- language and accessibility context
- conversation state
- adaptive clinical questioning
- allopathic history pathway
- AYUSH history pathway
- patient-reported evidence capture
- red-flag/safety-gate integration
- document-intake orchestration
- downstream handoff to the clinical evidence layer

## PRISM is not

- an autonomous diagnostic system
- a prescription engine
- the owner of ABDM consent state
- a replacement for the physician

## Initial module boundaries

```text
services/prism/
├── intake/          Session + patient interaction orchestration
├── conversation/    Clinical question/state engine
├── asr/             Speech adapter interface + evaluations
├── ocr/             Document adapter interface + evaluations
├── clinical-history/Allopathic structured history
├── ayush/           AYUSH pathway definitions
└── safety/          Red-flag interface and escalation contract
```

Research implementations may live beside these interfaces until a production decision is approved.
