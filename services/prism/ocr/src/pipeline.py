from .ocr_engine import PaddleOCREngine
from .preprocess import OpenCVPreprocessor
from .structurer import ClinicalStructurer

class DocumentIntelligencePipeline:
    def __init__(self):
        self.preprocessor = OpenCVPreprocessor()
        self.ocr = PaddleOCREngine()
        self.structurer = ClinicalStructurer()

    def process(self, document_id: str, image_bytes: bytes) -> dict:
        processed = self.preprocessor.run(image_bytes)
        raw_text, evidence = self.ocr.extract(processed)
        return self.structurer.structure(document_id, raw_text, evidence).model_dump()
