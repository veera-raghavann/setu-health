import test from "node:test"; import assert from "node:assert/strict";
import {GroqAsrAdapter} from "../src/asr/groqAdapter.js";

test("groq adapter throws a clear configuration error when unset",async()=>{
 delete process.env.GROQ_API_KEY;
 await assert.rejects(
  ()=>new GroqAsrAdapter().transcribe({buffer:Buffer.from("x"),mimeType:"audio/webm",filename:"speech.webm"}),
  /GROQ_API_KEY not configured/
 );
});

test("groq adapter returns transcribed text on success",async()=>{
 process.env.GROQ_API_KEY="test-key";
 const originalFetch=global.fetch;
 (global as any).fetch=async(url:string,init:any)=>{
  assert.equal(url,"https://api.groq.com/openai/v1/audio/transcriptions");
  assert.equal(init.headers.Authorization,"Bearer test-key");
  return {ok:true,json:async()=>({text:"I have a fever",language:"en"})};
 };
 try{
  const r=await new GroqAsrAdapter().transcribe({buffer:Buffer.from("x"),mimeType:"audio/webm",filename:"speech.webm"});
  assert.equal(r.text,"I have a fever");
  assert.equal(r.engine,"groq-whisper-large-v3");
 }finally{(global as any).fetch=originalFetch;delete process.env.GROQ_API_KEY}
});

test("groq adapter surfaces a clear error on a non-2xx response",async()=>{
 process.env.GROQ_API_KEY="test-key";
 const originalFetch=global.fetch;
 (global as any).fetch=async()=>({ok:false,status:401,statusText:"Unauthorized",text:async()=>"invalid api key"});
 try{
  await assert.rejects(
   ()=>new GroqAsrAdapter().transcribe({buffer:Buffer.from("x"),mimeType:"audio/webm",filename:"speech.webm"}),
   /Groq transcription failed \(401\)/
  );
 }finally{(global as any).fetch=originalFetch;delete process.env.GROQ_API_KEY}
});
