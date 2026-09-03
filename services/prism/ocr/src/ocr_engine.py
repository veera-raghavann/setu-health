from typing import Any
import numpy as np
from .models import Evidence
LANG_MAP={"en-IN":"en","en":"en","ta-IN":"ta","ta":"ta","hi-IN":"hi","hi":"hi"}
class PaddleOCREngine:
    def __init__(self): self._engines:dict[str,Any]={}
    def _get_engine(self,language_hint:str|None=None):
        lang=LANG_MAP.get(language_hint or "en","en")
        if lang not in self._engines:
            from paddleocr import PaddleOCR
            self._engines[lang]=PaddleOCR(use_angle_cls=True,lang=lang,use_gpu=False)
        return self._engines[lang],lang
    def extract(self,image:np.ndarray,page_number:int=1,language_hint:str|None=None):
        engine,lang=self._get_engine(language_hint);result=engine.ocr(image,cls=True);lines=[];evidence=[]
        for page in result or []:
            if not page: continue
            for row in page:
                bbox,recognition=row;value,confidence=recognition;value=str(value).strip()
                if not value: continue
                lines.append(value);evidence.append(Evidence(page=page_number,text=value,confidence=float(confidence),bbox=[[float(x),float(y)] for x,y in bbox]))
        return "\n".join(lines),evidence,lang