# ADR 0002 — PRISM Contract-First Integration

## Status
Accepted for initial implementation

## Decision
OCR, ASR, client applications, clinical history pathways and downstream reconciliation will integrate through shared domain contracts rather than direct vendor-to-vendor coupling.

## Why
Three parallel research tracks are active: OCR, Indian-language ASR/Bhashini, and Flutter/React Native. Their outputs must converge without forcing the team to rewrite the clinical workflow when a provider/model changes.

## Contract shape

At minimum, downstream consumers need:

- session context
- language
- transcript/interaction data
- structured clinical responses
- documents and extraction results
- clinical entities
- safety flags
- evidence/provenance

## Rule
Research teams can change providers/models behind an adapter as long as the adapter satisfies the approved contract and the benchmark evidence is recorded.

## Consequence
The team can evaluate multiple OCR/ASR/client options in parallel while PRISM's clinical workflow remains stable.
