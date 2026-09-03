# OCR Worker Contract

The API does not embed PaddleOCR directly.

Production flow:

```
PRISM API
   │
   ├── enqueue processing job
   ▼
Python OCR Worker
   │
   ├── OpenCV preprocessing
   ├── PDF page rendering
   └── PaddleOCR
   │
   ▼
Structured OCR JSON
   │
   ▼
PRISM API evidence pipeline
```

## Reason

PaddleOCR and OpenCV belong naturally in a Python worker environment. Keeping them outside the TypeScript API prevents heavy ML dependencies from blocking request handling.

## Worker input

- resource ID
- signed/internal binary location
- media type
- language hints

## Worker output

- pages
- blocks
- text
- confidence
- bounding regions
- engine/version metadata

The original file is never overwritten.