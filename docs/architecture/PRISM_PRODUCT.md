# PRISM Product Architecture

PRISM is the patient-facing entry point of SETU.

## Entry paths
1. Current health concern — adaptive case-taking.
2. Health profile — progressive collection of longitudinal context.
3. Previous records — document ingestion/OCR with provenance.
4. ABHA — consented interoperability through the ABDM adapter.

## Runtime
Voice, text and touch are normalized into one intake response. The orchestrator owns session state and next action. The client owns presentation. ASR and OCR remain adapters.

## Data architecture
Development: in-memory session store.
Production target: PostgreSQL for application metadata and clinical evidence references; encrypted object storage for documents/audio where retention is approved; ABDM/FHIR data retrieved only through applicable consent and integration controls.

## Safety
PRISM is intake support, not autonomous diagnosis. Emergency escalation must be deterministic and clinically governed.