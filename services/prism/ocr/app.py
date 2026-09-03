from fastapi import FastAPI, File, HTTPException, UploadFile

from src.pipeline import DocumentIntelligencePipeline

app = FastAPI(title="PRISM Document Intelligence", version="0.1.0")
pipeline = DocumentIntelligencePipeline()

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "prism-ocr"}

@app.post("/v1/documents/process")
async def process_document(file: UploadFile = File(...)) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="MVP currently accepts image uploads.")
    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return pipeline.process(file.filename or "uploaded-document", payload)
