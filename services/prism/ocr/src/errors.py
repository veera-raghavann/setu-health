class DocumentProcessingError(Exception):
    def __init__(self, message: str, code: str = "document_processing_failed"):
        self.message = message
        self.code = code
        super().__init__(message)

class UnsupportedDocumentError(DocumentProcessingError):
    def __init__(self, message: str = "Unsupported or invalid document."):
        super().__init__(message, "unsupported_document")

class OversizedDocumentError(DocumentProcessingError):
    def __init__(self, message: str = "Document exceeds configured upload limit."):
        super().__init__(message, "document_too_large")
