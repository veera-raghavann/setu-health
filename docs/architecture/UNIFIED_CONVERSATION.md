# Unified Patient Conversation

## Principle

Touch, text and voice are input modalities. They must never create three different clinical workflows.

## Pipeline

Input → modality adapter → normalized patient statement → language context → conversation engine → safety gate → missing-information logic → next question.

## Current implementation

- text responses
- touch responses
- voice endpoint
- Bhashini ASR adapter contract
- language context carried by the intake session
- localized system copy for English, Tamil and Hindi
- structured next-action contract

## Safety

Language localization does not alter clinical meaning. Emergency routing always takes priority over routine intake.

## Future

LLM reasoning, when added, must be constrained by structured session state and safety rules. It should propose language and question phrasing, not silently become the sole source of triage logic.