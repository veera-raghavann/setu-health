# Clinical Schema

This package defines the shared contract used by PRISM, OCR/document intelligence, ASR/NLU, reconciliation and physician-facing applications.

## Initial domain objects

- Patient
- IntakeSession
- ConsentContext
- ConversationTurn
- ClinicalResponse
- ClinicalEntity
- HistorySection
- Document
- OCRResult
- SafetyFlag
- Evidence
- TimelineEvent
- ReconciliationFinding

## Contract principles

1. Every clinical fact carries provenance.
2. Patient-reported information is distinguishable from source-record information.
3. Extracted information carries confidence/uncertainty.
4. Dates and event dates are distinct from ingestion timestamps.
5. Original source text/display is preserved alongside normalized concepts.
6. Schema changes require review because multiple services depend on this contract.
