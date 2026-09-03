# ADR 0003 — PRISM product-first implementation

PRISM is implemented as one patient health workspace rather than a standalone questionnaire.

The SIH primary flow remains patient case-taking. Additional entry paths progressively collect health context, previous records and consented interoperability data.

The first executable slice is:
patient opens web app → starts current health concern → backend creates session → patient answers → backend updates context → backend returns next question.

This creates the spine into which ASR, OCR, ABHA and MedBridge integrate.