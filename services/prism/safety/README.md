# PRISM Safety Gate

The safety gate is intentionally deterministic and clinician-governed.

It consumes structured clinical observations from the intake flow and evaluates configured red-flag rules. An LLM may assist with language interpretation upstream, but it must not grant access, override a safety rule, or make the final clinical decision.

When a configured red flag is triggered:

1. mark the session as requiring urgent review;
2. surface a clear patient-facing instruction;
3. notify the designated triage workflow where integrated;
4. record the event for audit;
5. prevent the normal queue flow from silently continuing.

Production rules require clinical review and validation.
