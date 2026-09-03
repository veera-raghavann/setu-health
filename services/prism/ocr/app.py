import logging
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import get_settings
from src.errors import DocumentProcessingError
from src.ingestion import ingest
from src.logging_config import configure_logging
from src.pipeline import DocumentIntelligencePipeline

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("prism.ocr")

app = FastAPI(
    title="PRISM Medical Document Intelligence",
    version="0.3.0",
    description="Evidence-preserving medical document ingestion and clinical structuring service.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
)

pipeline = DocumentIntelligencePipeline()

@app.exception_handler(DocumentProcessingError)
async def document_error_handler(_: Request, exc: DocumentProcessingError):
    status = 413 if exc.code == "document_too_large" else 422
    return JSONResponse(status_code=status, content={"error": exc.code, "message": exc.message})

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "prism-ocr", "version": app.version}

@app.post("/v1/documents/process")
async def process_document(file: UploadFile = File(...)) -> dict:
    payload = await file.read()
    document = ingest(file.filename or "uploaded-document", file.content_type, payload)
    logger.info("document_received id=%s bytes=%s", document.document_id, len(payload))
    try:
        result = pipeline.process(document.document_id, document.content, document.media_type)
        result["metadata"]["filename"] = document.filename
        result["metadata"]["media_type"] = document.media_type
        return result
    except ValueError as exc:
        logger.warning("document_processing_failed id=%s reason=%s", document.document_id, str(exc))
        raise HTTPException(status_code=422, detail="Document could not be processed.") from exc
