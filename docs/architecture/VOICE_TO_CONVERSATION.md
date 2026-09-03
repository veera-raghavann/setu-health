# Voice to Conversation

Browser microphone
→ MediaRecorder
→ PRISM voice endpoint
→ Bhashini ASR adapter
→ transcript + language + confidence
→ unified conversation engine
→ same session
→ next question

ASR failure is isolated from the clinical session. The patient can immediately fall back to text or touch.

Production integration requires Bhashini onboarding credentials and the provider-specific request format to be configured in the adapter.