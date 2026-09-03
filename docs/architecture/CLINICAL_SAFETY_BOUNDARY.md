# Clinical Safety Boundary

PRISM performs patient intake, structuring, provenance preservation and routing support.

It does not autonomously diagnose, prescribe, clear a medication as safe, or replace emergency services.

## Red flags

Rule-based red-flag screening is an initial routing layer. Any positive emergency flag terminates routine questioning and requests human triage.

## AI boundary

Future LLM components may help extract and structure information, but clinical claims must retain evidence provenance and clinician review status.

## Summary boundary

Every generated summary is explicitly marked as an intake draft until clinician confirmation.