# Contributing to SETU

## Branches

- `main` — reviewed production baseline
- `develop` — integration branch when introduced
- `feature/<area>-<short-name>` — feature work
- `research/<area>-<short-name>` — research/prototype work
- `fix/<area>-<short-name>` — bug fixes
- `docs/<area>-<short-name>` — documentation

## Pull requests

Every production change should be reviewed through a pull request. PRs should explain:

1. What changed?
2. Why is the change needed?
3. What clinical or security assumptions does it introduce?
4. How was it tested?
5. Does it change an external API/standard contract?

## Clinical safety

Changes affecting clinical questions, red-flag rules, medication/allergy handling, summarisation, terminology or patient-facing consent must include the relevant documentation and review notes.

## Research code

Experimental OCR, ASR and model evaluations belong under the appropriate research/service boundary. Do not make an experimental model a production dependency without benchmark evidence and review.

## Secrets and health data

Never commit credentials, certificates, API keys, real patient data, production FHIR payloads, or personal health information. Use synthetic fixtures for development.

## Commit style

Use concise conventional-style messages such as:

- `feat(prism): add intake session contract`
- `research(asr): benchmark bilingual speech models`
- `feat(ocr): add document extraction adapter`
- `docs(architecture): define clinical evidence flow`
- `fix(consent): prevent expired session access`
