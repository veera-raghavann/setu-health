# PRISM OCR Worker

Production-oriented OCR worker using OpenCV + PaddleOCR.

## Responsibilities

- Accept image/PDF resources
- Render PDF pages
- Preprocess images
- Run PaddleOCR
- Return page/block/confidence/bounding-box provenance

It never writes clinical facts directly. PRISM API owns evidence normalization and persistence.

## Run

`uvicorn main:app --host 0.0.0.0 --port 8100`

## API

POST `/v1/ocr` multipart field `file`.

Never expose this worker directly to the public internet in production.