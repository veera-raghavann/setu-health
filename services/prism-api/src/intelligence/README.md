# Conversation Intelligence

This layer is provider-independent.

## Current implementation

`RuleConversationModel` is an explainable baseline used before introducing an external LLM.

## Contract

A model may interpret patient language, but it returns structured facts only:

- field
- value
- confidence
- evidence
- intent

The model cannot directly emit clinical advice or arbitrary UI actions.

## Future providers

A provider adapter may implement:

- structured-output LLM
- local model
- hosted model

All providers must satisfy `ConversationModel` and pass output validation.