# Conversation Engine

## Input contract

Every patient turn arrives as:

- value
- input_mode: voice | touch | text
- language

The backend owns the clinical state and next question.

## Why

Voice and touch are transport mechanisms, not separate clinical workflows. Both must converge on the same normalized response contract.

## Current flow

1. Patient starts session.
2. Backend asks opening question.
3. Patient responds through voice, touch or text.
4. Safety screen executes.
5. Protocol engine determines next unanswered item.
6. Backend returns the next action.
7. Session state remains recoverable.

Future adapters:

- BHASHINI ASR → normalized text input
- Translation layer → canonical clinical processing
- Local-language response generation → patient output
- TTS → spoken response