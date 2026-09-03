from typing import Any
import numpy as np
from .models import Evidence

class PaddleOCREngine:
    def __init__(self):
        self._engine: Any | None = None

    def _get_engine(self):
        if self._engine is None:
            from paddleocr import PaddleOCR
            self._engine = PaddleOCR(use_angle_cls=True, lang="en", use_gpu=False)
        return self._engine

    def extract(self, image: np.ndarray):
        result = self._get_engine().ocr(image, cls=True)
        lines, evidence = [], []
        for page in result:
            if not page:
                continue
            for row in page:
                bbox, recognition = row
                value, confidence = recognition
                lines.append(value)
                evidence.append(Evidence(page=1, text=value, confidence=float(confidence), bbox=[[float(x), float(y)] for x, y in bbox]))
        return "\n".join(lines), evidence
