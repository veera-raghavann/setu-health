import type {OcrAdapter} from "./ocrAdapter.js"; import type {OcrResult} from "./types.js";
export class HttpOcrWorkerAdapter implements OcrAdapter{
 constructor(private baseUrl=process.env.OCR_WORKER_URL||"http://localhost:8100"){}
 async extract(input:{resourceId:string;mediaType:string;bytes?:Buffer}):Promise<OcrResult>{
  if(!input.bytes) return {engine:"paddleocr",languageHints:[],pages:[],status:"failed",error:"resource bytes unavailable"};
  const form=new FormData(); form.append("file",new Blob([input.bytes],{type:input.mediaType}),input.resourceId+"."+((input.mediaType.split("/")[1]||"bin").replace("jpeg","jpg")));
  const res=await fetch(this.baseUrl+"/v1/ocr",{method:"POST",body:form}); if(!res.ok)return{engine:"paddleocr",languageHints:[],pages:[],status:"failed",error:`worker returned ${res.status}`};
  return await res.json() as OcrResult;
 }} 