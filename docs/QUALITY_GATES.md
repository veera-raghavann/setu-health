# PRISM Quality Gates

Before merging PRISM-001 to main, verify:

## Build

- patient app TypeScript build passes
- API TypeScript build passes

## Voice

- microphone permission
- BHASHINI connection
- interim transcript
- final transcript
- Tamil test
- Hindi test
- English test
- graceful missing-key error

## Conversation

- free-text chief complaint
- touch answer
- voice answer
- record-upload intent
- ABHA intent
- emergency red-flag path
- no duplicate first-answer assignment

## Evidence

- original file retained
- resource identifier persists
- extracted evidence links origin
- patient-reported vs extracted distinction visible
- AYUSH/Allopathy classification preserved

## Security

- no secrets committed
- no production long-lived provider key exposed
- consent boundary documented

## Interoperability

- FHIR mapping remains provenance-aware
- ABHA/ABDM adapter remains isolated from core logic