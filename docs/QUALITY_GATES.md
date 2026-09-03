# PRISM Quality Gates

Before PRISM-001 merges to main:

## Multilingual

- English, Tamil and Hindi typed intake
- English, Tamil and Hindi voice path
- localized next questions and touch labels
- emergency phrases in all supported languages
- record-upload and ABHA intents in all supported languages
- OCR language hint propagation

## Voice

- microphone permission
- BHASHINI connection
- interim and final transcripts
- missing-key handling
- same-language response path

## OCR

- original file retained
- source resource ID persists
- evidence points to page and bounding box
- low-quality review flag
- multilingual OCR validation
- AYUSH/Allopathy classification remains separate

## Conversation

- free text, touch and voice enter same engine
- first answer is not duplicated
- navigation intents trigger UI
- deterministic safety remains authoritative
- every major decision has a trace

## Engineering

- patient app build
- API typecheck
- API tests
- OCR tests
- no secrets committed
- no long-lived production provider key exposed

Passing a checklist item means it has been executed against the running stack, not merely implemented in code.