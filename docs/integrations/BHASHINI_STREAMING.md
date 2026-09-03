# BHASHINI Streaming STT

PRISM uses the official BHASHINI streaming speech example as the protocol reference.

Current client protocol:

Browser microphone
→ AudioWorklet
→ mono PCM
→ 16 kHz
→ signed linear16 little-endian
→ `wss://tts.bhashini.ai/stt/stream`
→ WebSocket subprotocol `apikey.<32-character-key>`
→ start event with language and VAD
→ interim/final transcripts

The implementation follows the public BHASHINI API examples. citeturn1search1

## Environment

For local prototype testing:

```
VITE_BHASHINI_API_KEY=<your 32-character key>
```

The key is intentionally never committed.

## Important production boundary

VITE variables are exposed to the browser. A production deployment must not expose a long-lived BHASHINI key. Replace direct browser authentication with a server-side token/proxy pattern before public deployment.

## Supported PRISM mapping

- en-IN → English
- ta-IN → Tamil
- hi-IN → Hindi

## Validation status

Protocol and implementation are configured against the official public streaming example. Live validation requires a valid project BHASHINI API key and microphone-capable HTTPS/localhost environment.