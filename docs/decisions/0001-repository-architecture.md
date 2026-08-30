# ADR 0001 — Production Repository Architecture

## Status
Accepted for initial foundation

## Decision
SETU will use a modular repository structure with clear boundaries for patient-facing applications, PRISM, MedBridge, ABDM/FHIR adapters, shared clinical contracts, infrastructure, tests and documentation.

## Rationale
The project combines client applications, TypeScript services, possible Python-based AI/research components and standards/integration code. A single technology-specific scaffold would create coupling. Domain boundaries let the OCR, ASR and client research tracks converge on stable contracts.

## Consequences
- Shared clinical schemas become a controlled interface.
- External ABDM contracts remain isolated behind adapters.
- Experimental research can be benchmarked before production adoption.
- Cross-service changes require explicit review.

## Safety implication
Clinical logic and safety rules must not become hidden dependencies inside an AI service or UI component.
