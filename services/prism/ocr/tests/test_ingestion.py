import pytest
from src.errors import UnsupportedDocumentError
from src.ingestion import ingest

def test_rejects_empty_upload():
    with pytest.raises(UnsupportedDocumentError):
        ingest("empty.png", "image/png", b"")

def test_rejects_unknown_type():
    with pytest.raises(UnsupportedDocumentError):
        ingest("file.txt", "text/plain", b"hello")
