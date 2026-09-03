# PRISM Conversation Intelligence

## Principle

PRISM separates **understanding** from **authority**.

```
Patient language
  → Intelligence interprets
  → Safety rules evaluate
  → Protocol determines constraints
  → Validator approves
  → UI renders
```

## Current v1

An explainable rule-based interpretation model is active. It extracts probable patient-reported fields and navigation intent.

This is intentionally not presented as an LLM.

## Future LLM insertion

The LLM will sit behind the `ConversationModel` interface and must produce typed structured output. It will not directly control:

- emergency decisions
- diagnosis
- medication advice
- consent
- UI execution

## Patient fact provenance

Every interpreted fact must carry:

```
source: patient_reported
evidence: exact patient statement
confidence: 0..1
```

The source statement remains traceable.