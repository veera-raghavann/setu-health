"""
SETU PRISM OCR Worker — lite runtime.

Same HTTP contract as main.py (PaddleOCR-based production worker):
POST /v1/ocr -> {engine, languageHints, pages:[{page,text,confidence,blocks}], status}

This runtime swaps PaddleOCR (heavy GPU/CPU ML deps, no Windows/Python 3.13 wheel
at demo time) for Tesseract via pytesseract, which is lightweight and reliable to
install on any machine with the Tesseract binary present. It exists so the
prototype has a real, working OCR path for demos without depending on a
multi-hundred-MB ML install succeeding on the demo machine.

Per the repo's "prototype != production" principle, this is a swappable
adapter behind the same contract — the production target remains the
PaddleOCR worker in main.py.
"""
import io, os, shutil
from typing import Optional

import pymupdf as fitz
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract

app = FastAPI(title="SETU PRISM OCR Worker (lite)", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_TESSERACT_CMD = os.getenv("TESSERACT_CMD") or shutil.which("tesseract") or r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(_TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = _TESSERACT_CMD
_TESSERACT_AVAILABLE = os.path.exists(_TESSERACT_CMD)

LANG = os.getenv("OCR_LANG", "eng")


def run_image(image: Image.Image, page: int):
    if not _TESSERACT_AVAILABLE:
        return {"page": page, "text": "", "confidence": 0.0, "blocks": []}
    data = pytesseract.image_to_data(image, lang=LANG, output_type=pytesseract.Output.DICT)
    blocks, texts, conf = [], [], []
    n = len(data.get("text", []))
    for i in range(n):
        text = (data["text"][i] or "").strip()
        if not text:
            continue
        c = float(data["conf"][i]) if data["conf"][i] not in ("-1", -1) else 0.0
        x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
        blocks.append({
            "text": text,
            "confidence": c / 100.0 if c > 1 else c,
            "boundingBox": [float(x), float(y), float(x + w), float(y), float(x + w), float(y + h), float(x), float(y + h)],
        })
        texts.append(text)
        conf.append(c / 100.0 if c > 1 else c)
    return {
        "page": page,
        "text": " ".join(texts),
        "confidence": (sum(conf) / len(conf)) if conf else 0.0,
        "blocks": blocks,
    }


@app.get("/health")
def health():
    return {"status": "ok" if _TESSERACT_AVAILABLE else "degraded", "engine": "tesseract-lite", "tesseractAvailable": _TESSERACT_AVAILABLE}


@app.post("/v1/ocr")
async def extract(file: UploadFile = File(...), language_hint: Optional[str] = None):
    data = await file.read()
    if not data:
        raise HTTPException(400, "empty file")

    pages = []
    media = file.content_type or ""
    is_pdf = media == "application/pdf" or (file.filename or "").lower().endswith(".pdf")

    if is_pdf:
        pdf = fitz.open(stream=data, filetype="pdf")
        for i, p in enumerate(pdf):
            embedded_text = p.get_text().strip()
            if embedded_text:
                pages.append({"page": i + 1, "text": embedded_text, "confidence": 0.99, "blocks": []})
                continue
            pix = p.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            pages.append(run_image(image, i + 1))
    else:
        image = Image.open(io.BytesIO(data)).convert("RGB")
        pages.append(run_image(image, 1))

    return {
        "engine": "tesseract-lite" if _TESSERACT_AVAILABLE else "tesseract-lite-unavailable",
        "languageHints": [language_hint or LANG],
        "pages": pages,
        "status": "completed",
    }
