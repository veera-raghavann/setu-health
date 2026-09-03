import os,cv2,fitz,numpy as np
from typing import Optional
from fastapi import FastAPI,File,UploadFile,HTTPException
from paddleocr import PaddleOCR

app=FastAPI(title="SETU PRISM OCR Worker",version="0.2.1")
ENGINES={}
LANG_MAP={"en-IN":"en","en":"en","ta-IN":"ta","ta":"ta","hi-IN":"hi","hi":"hi"}

def engine(lang):
    lang=LANG_MAP.get(lang,"en")
    if lang not in ENGINES:
        ENGINES[lang]=PaddleOCR(use_angle_cls=True,lang=lang)
    return ENGINES[lang]

def preprocess(image):
    if image is None:
        raise ValueError("invalid image")
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY) if len(image.shape)==3 else image
    gray=cv2.fastNlMeansDenoising(gray,None,10,7,21)
    return cv2.cvtColor(gray,cv2.COLOR_GRAY2BGR)

def detect_candidates(image,hint):
    if hint and hint.lower() not in ("auto","mixed",""):
        return [LANG_MAP.get(hint,hint)]
    return ["en","ta","hi"]

def run_page(image,page,hint):
    image=preprocess(image)
    best=None
    for lang in detect_candidates(image,hint):
        result=engine(lang).ocr(image,cls=True)
        blocks=[];texts=[];conf=[]
        for line in (result[0] or []):
            box,(text,confidence)=line
            flat=[float(v) for point in box for v in point]
            blocks.append({"text":text,"confidence":float(confidence),"boundingBox":flat})
            texts.append(text);conf.append(float(confidence))
        candidate={
            "page":page,
            "text":"\n".join(texts),
            "confidence":sum(conf)/len(conf) if conf else 0.0,
            "blocks":blocks,
            "language":lang
        }
        if best is None or candidate["confidence"]>best["confidence"]:
            best=candidate
    return best

@app.get("/health")
def health():
    return {"status":"ok","engine":"paddleocr","supported_languages":["en","ta","hi"]}

@app.post("/v1/ocr")
async def extract(file:UploadFile=File(...),language_hint:Optional[str]=None):
    data=await file.read()
    if not data:
        raise HTTPException(400,"empty file")
    pages=[]
    media=file.content_type or ""
    hint=language_hint or os.getenv("OCR_LANG","auto")
    if media=="application/pdf" or file.filename.lower().endswith(".pdf"):
        pdf=fitz.open(stream=data,filetype="pdf")
        for i,p in enumerate(pdf):
            pix=p.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
            image=cv2.imdecode(np.frombuffer(pix.tobytes("png"),np.uint8),cv2.IMREAD_COLOR)
            pages.append(run_page(image,i+1,hint))
    else:
        image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
        pages.append(run_page(image,1,hint))
    return {
        "engine":"paddleocr",
        "languageHints":sorted(set(p["language"] for p in pages)),
        "pages":pages,
        "status":"completed"
    }
