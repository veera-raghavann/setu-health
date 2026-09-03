import io
from dataclasses import dataclass
import cv2
import fitz
import numpy as np

from .errors import UnsupportedDocumentError

@dataclass
class DocumentPage:
    number: int
    image: np.ndarray

def decode_image(payload: bytes) -> list[DocumentPage]:
    image = cv2.imdecode(np.frombuffer(payload, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise UnsupportedDocumentError("Unable to decode image.")
    return [DocumentPage(number=1, image=image)]

def decode_pdf(payload: bytes, max_pages: int = 20) -> list[DocumentPage]:
    try:
        pdf = fitz.open(stream=io.BytesIO(payload), filetype="pdf")
    except Exception as exc:
        raise UnsupportedDocumentError("Unable to open PDF.") from exc
    if pdf.page_count == 0:
        raise UnsupportedDocumentError("PDF contains no pages.")
    if pdf.page_count > max_pages:
        raise UnsupportedDocumentError(f"PDF exceeds the {max_pages}-page MVP processing limit.")

    pages = []
    for index in range(pdf.page_count):
        page = pdf.load_page(index)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            array = cv2.cvtColor(array, cv2.COLOR_RGBA2BGR)
        elif pix.n == 3:
            array = cv2.cvtColor(array, cv2.COLOR_RGB2BGR)
        else:
            array = cv2.cvtColor(array, cv2.COLOR_GRAY2BGR)
        pages.append(DocumentPage(number=index + 1, image=array))
    return pages
