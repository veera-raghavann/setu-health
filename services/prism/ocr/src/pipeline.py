from .document_reader import decode_image,decode_pdf
from .ocr_engine import PaddleOCREngine
from .preprocess import OpenCVPreprocessor
from .quality import assess_image_quality
from .structurer import ClinicalStructurer
class DocumentIntelligencePipeline:
    def __init__(self): self.preprocessor=OpenCVPreprocessor();self.ocr=PaddleOCREngine();self.structurer=ClinicalStructurer()
    def process(self,document_id:str,payload:bytes,media_type:str="image/jpeg",language_hint:str|None=None)->dict:
        pages=decode_pdf(payload) if media_type=="application/pdf" else decode_image(payload);page_texts=[];all_evidence=[];quality=[];used=[]
        for page in pages:
            processed=self.preprocessor.run_image(page.image);quality.append({"page":page.number,**assess_image_quality(processed)})
            text,evidence,lang=self.ocr.extract(processed,page.number,language_hint);page_texts.append(text);all_evidence.extend(evidence);used.append(lang)
        raw_text="\n\n".join(text for text in page_texts if text);result=self.structurer.structure(document_id,raw_text,all_evidence).model_dump()
        result["language_hint"]=language_hint;result["metadata"].update({"page_count":len(pages),"quality":quality,"ocr_engine":"paddleocr","ocr_languages":sorted(set(used))})
        result["review_required"]=result["review_required"] or any(item["review_recommended"] for item in quality);return result