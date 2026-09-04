import test from "node:test"; import assert from "node:assert/strict";
import {MyMemoryTranslationAdapter} from "../src/translation/myMemoryAdapter.js";
import {PassthroughTranslationAdapter} from "../src/translation/passthroughAdapter.js";

test("passthrough adapter returns input unchanged",async()=>{
 const a=new PassthroughTranslationAdapter();
 const r=await a.translate({text:"hello",from:"en",to:"hi"});
 assert.equal(r.text,"hello"); assert.equal(r.engine,"none");
});

test("mymemory adapter fails open (returns original text) on a network error",async()=>{
 const originalFetch=global.fetch;
 (global as any).fetch=async()=>{throw new Error("network down")};
 try{
  const r=await new MyMemoryTranslationAdapter().translate({text:"hello",from:"en",to:"hi"});
  assert.equal(r.text,"hello"); assert.equal(r.engine,"mymemory-failed");
 }finally{(global as any).fetch=originalFetch}
});

test("mymemory adapter fails open on a non-2xx response",async()=>{
 const originalFetch=global.fetch;
 (global as any).fetch=async()=>({ok:false,status:500});
 try{
  const r=await new MyMemoryTranslationAdapter().translate({text:"hello",from:"en",to:"hi"});
  assert.equal(r.text,"hello"); assert.equal(r.engine,"mymemory-failed");
 }finally{(global as any).fetch=originalFetch}
});

test("mymemory adapter skips the network call entirely for same-language text",async()=>{
 let called=false;
 const originalFetch=global.fetch;
 (global as any).fetch=async()=>{called=true;return {ok:true,json:async()=>({responseData:{translatedText:"x"}})}};
 try{
  const r=await new MyMemoryTranslationAdapter().translate({text:"hello",from:"en",to:"en"});
  assert.equal(r.text,"hello"); assert.equal(called,false);
 }finally{(global as any).fetch=originalFetch}
});

test("mymemory adapter returns the translated text on success",async()=>{
 const originalFetch=global.fetch;
 (global as any).fetch=async()=>({ok:true,json:async()=>({responseData:{translatedText:"नमस्ते",match:0.9}})});
 try{
  const r=await new MyMemoryTranslationAdapter().translate({text:"hello",from:"en",to:"hi"});
  assert.equal(r.text,"नमस्ते"); assert.equal(r.engine,"mymemory");
 }finally{(global as any).fetch=originalFetch}
});

test("bhashini adapter throws a clear configuration error when unset",async()=>{
 delete process.env.BHASHINI_API_KEY; delete process.env.BHASHINI_PIPELINE_URL;
 const {BhashiniTranslationAdapter}=await import("../src/translation/bhashiniAdapter.js");
 await assert.rejects(()=>new BhashiniTranslationAdapter().translate({text:"hi",from:"en",to:"hi"}),/not configured/);
});
