import type {AsrAdapter,AsrResult} from "./asrAdapter.js";

/**
 * Groq's free-tier hosted Whisper (whisper-large-v3-turbo) via an OpenAI-compatible
 * /audio/transcriptions endpoint. Used instead of the browser's built-in
 * SpeechRecognition because its accuracy on accented/Indian-language speech was
 * not good enough — the mic is still used to *capture* audio (unavoidable), the
 * difference is transcription happens server-side against a real Whisper model.
 * Requires a free API key from https://console.groq.com.
 */
export class GroqAsrAdapter implements AsrAdapter{
 async transcribe({buffer,mimeType,filename,languageHint}:{buffer:Buffer;mimeType:string;filename:string;languageHint?:string}):Promise<AsrResult>{
  const key=process.env.GROQ_API_KEY;
  if(!key){
   throw new Error("GROQ_API_KEY not configured — sign up for a free key at https://console.groq.com and set it in .env to enable voice transcription.");
  }
  const form=new FormData();
  form.append("file",new Blob([buffer],{type:mimeType}),filename);
  form.append("model","whisper-large-v3-turbo");
  if(languageHint)form.append("language",languageHint);
  const res=await fetch("https://api.groq.com/openai/v1/audio/transcriptions",{method:"POST",headers:{Authorization:"Bearer "+key},body:form});
  if(!res.ok){
   const errText=await res.text().catch(()=>"");
   throw new Error(`Groq transcription failed (${res.status}): ${errText||res.statusText}`);
  }
  const data:any=await res.json();
  return {text:data.text||"",engine:"groq-whisper-large-v3-turbo",language:data.language};
 }
}
