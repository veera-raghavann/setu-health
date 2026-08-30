# PRISM ASR Adapter

Speech recognition is an adapter boundary, not a hard-coded vendor dependency.

Candidate providers/models are being researched separately, including Bhashini/AI4Bharat-class Indian-language systems.

The production interface should accept audio plus language/session context and return:

- transcript
- detected/declared language
- segment timestamps when available
- confidence metadata
- provider/model version

Clinical meaning must be resolved by the PRISM conversation layer, not assumed from raw ASR output.
