# PRISM Conversation Model Status

## Current production-prototype decision stack

There is deliberately no generative clinical model deciding triage or next required field yet.

| Layer | Technology | Role |
|---|---|---|
| Speech recognition | BHASHINI Streaming STT | Voice → transcript |
| Modality normalization | PRISM | Voice/text/touch → same turn |
| Safety | Deterministic red-flag rules | Emergency gate |
| Next question | Deterministic protocol engine | Required information sequencing |
| UI trigger | Structured nextAction contract | ASK / TRIAGE_ALERT / COMPLETE_SECTION |
| OCR | OpenCV + PaddleOCR + extraction layer | Document evidence |

## Why

At the current stage, deterministic clinical workflow is safer and easier to test than allowing an LLM to autonomously choose clinical questions.

## Planned model boundary

A future LLM may be added as a constrained **Conversation Intelligence Layer**. It may:

- understand free-text answers
- classify intent
- summarize context
- suggest phrasing
- identify which structured field an answer addresses

It must not independently:

- diagnose
- override emergency rules
- fabricate patient facts
- bypass consent
- create unsupported clinical conclusions

The deterministic safety and protocol layers remain authoritative.