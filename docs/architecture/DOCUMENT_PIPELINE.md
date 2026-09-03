# Document Pipeline

```
Patient Upload
      ↓
Create immutable original resource
      ↓
Private object storage
      ↓
Processing run
      ├── PDF text extraction
      ├── Image preprocessing
      └── OCR
      ↓
Create processed resource
      ↓
Evidence extraction
      ↓
Evidence linked to resource/page/region
      ↓
Health timeline projection
```

The original upload is retained independently from OCR output. Processing failure must not destroy the patient's original resource. Reprocessing creates a new processing run and preserves prior lineage.