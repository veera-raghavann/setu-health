import io, os, tempfile
from typing import Optional
import cv2, fitz
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from paddleocr import PaddleOCR

app=FastAPI(title="SETU PRISM OCR Worker",version="0.1.0")
ocr=PaddleOCR(use_angle_cls=True,lang=os.getenv("OCR_LANG","en"),show_log=False)

def preprocess(image:np.ndarray)->np.ndarray:
    if image is None: raise ValueError("invalid image")
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY) if len(image.shape)==3 else image
    gray=cv2.fastNlMeansDenoising(gray,None,10,7,21)
    return cv2.cvtColor(gray,cv2.COLOR_GRAY2BGR)

def run_page(image:np.ndarray,page:int):
    result=ocr.ocr(preprocess(image),cls=True)
    blocks=[]; texts=[]; conf=[]
    for line in result[0] or []:
        box,(text,confidence)=line
        flat=[float(v) for point in box for v in point]
        blocks.append({"text":text,"confidence":float(confidence),"boundingBox":flat})
        texts.append(text); conf.append(float(confidence))
    return {"page":page,"text":"\n".join(texts),"confidence":sum(conf)/len(conf) if conf else 0.0,"blocks":blocks}

@app.get("/health")
def health(): return {"status":"ok","engine":"paddleocr"}

@app.post("/v1/ocr")
async def extract(file:UploadFile=File(...),language_hint:Optional[str]=None):
    data=await file.read()
    if not data: raise HTTPException(400,"empty file")
    pages=[]
    media=file.content_type or ""
    if media=="application/pdf" or file.filename.lower().endswith(".pdf"):
        pdf=fitz.open(stream=data,filetype="pdf")
        for i,p in enumerate(pdf):
            pix=p.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
            image=cv2.imdecode(np.frombuffer(pix.tobytes("png"),np.uint8),cv2.IMREAD_COLOR)
            pages.append(run_page(image,i+1))
    else:
        image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_COLOR)
        pages.append(run_page(image,1))
    return {"engine":"paddleocr","languageHints":[language_hint or os.getenv("OCR_LANG","en")],"pages":pages,"status":"completed"}