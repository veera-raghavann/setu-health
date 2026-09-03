import io
import uuid
from dataclasses import dataclass
from PIL import Image, UnidentifiedImageError

from .config import get_settings
from .errors import OversizedDocumentError, UnsupportedDocumentError

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

@dataclass
class IngestedDocument:
    document_id: str
    filename: str
    media_type: str
    content: bytes

def ingest(filename: str, media_type: str | None, payload: bytes) -> IngestedDocument:
    settings = get_settings()
    if not payload:
        raise UnsupportedDocumentError("Uploaded document is empty.")
    if len(payload) > settings.max_upload_bytes:
        raise OversizedDocumentError()
    if media_type not in ALLOWED_IMAGE_TYPES:
        raise UnsupportedDocumentError("MVP currently accepts JPEG, PNG, and WEBP images.")

    try:
        image = Image.open(io.BytesIO(payload))
        image.verify()
    except (UnidentifiedImageError, OSError):
        raise UnsupportedDocumentError("Uploaded bytes are not a valid image.")

    return IngestedDocument(
        document_id=str(uuid.uuid4()),
        filename=filename or "uploaded-document",
        media_type=media_type,
        content=payload,
    )
