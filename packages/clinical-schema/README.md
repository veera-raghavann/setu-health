# Clinical Schema

This package defines the shared contract used by PRISM, OCR/document intelligence, ASR/NLU, allopathic and AYUSH pathways, ABDM/FHIR adapters, reconciliation and physician-facing applications.

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
- ResourceReference
- Verification
- TimelineEvent
- ReconciliationFinding

## Evidence dimensions

Every clinical fact is classified independently by:

1. **Clinical pathway** — allopathic, AYUSH, cross-cutting or unknown.
2. **Origin** — patient, document, FHIR, clinician or system.
3. **Source class** — patient-reported, patient-provided document, ABDM exchange, clinician-confirmed, system-derived or unknown.
4. **Verification state** — what has actually been verified; transport provenance is not clinical confirmation.
5. **Resource references** — the exact conversation turn, touch response, document/page/region, FHIR resource, clinician review or system process supporting the fact.

## Contract principles

1. Every clinical fact carries provenance and at least one resource reference.
2. Patient-reported information is distinguishable from patient-provided document information.
3. ABDM/ABHA-consented exchange data is distinguishable from patient-side and clinician-confirmed data.
4. Allopathic and AYUSH evidence can coexist without collapsing their clinical meaning.
5. Extracted information carries confidence/uncertainty separately from verification state.
6. Dates and event dates are distinct from ingestion timestamps.
7. Original source text/display is preserved alongside normalized concepts.
8. Schema changes require review because multiple services depend on this contract.
