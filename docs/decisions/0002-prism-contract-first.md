# ADR 0002 — PRISM Shared Contract

## Status
Accepted

## Decision
PRISM's OCR, ASR, patient client, clinical history pathways and downstream reconciliation will integrate through one shared clinical evidence contract rather than direct vendor-to-vendor coupling.

## Why
Three parallel workstreams are active: OCR, Indian-language ASR/Bhashini, and the patient client (Flutter/React Native). Their outputs must converge on the same clinical evidence representation so that a provider or model can change without rewriting the clinical workflow.

## Shared contract

The shared PRISM contract covers the information needed across the pipeline:

- session context
- language
- transcript / interaction data
- structured clinical responses
- documents and extraction results
- clinical entities
- safety flags
- evidence and provenance

The contract is an engineering interface between PRISM components. It is not a vendor-specific API and it is not a separate branch or project.

## Team workflow

For normal PRISM work, use one branch per PRISM issue:

`PRISM-001` → implementation → pull request → review → merge to `main` → delete branch

Do not create additional branch layers such as `foundation/...`, `contract/...`, or `v0/...` unless the team later has a concrete need for them.

## Rule
Research teams may change providers or models behind an adapter as long as the adapter produces the agreed PRISM contract and records benchmark evidence.

## Consequence
OCR, ASR and client work can proceed in parallel while remaining interoperable with the same clinical workflow and downstream MedBridge services.
