export interface AsrResult{text:string;engine:string;language?:string}
export interface AsrAdapter{
 transcribe(input:{buffer:Buffer;mimeType:string;filename:string;languageHint?:string}):Promise<AsrResult>;
}

import {GroqAsrAdapter} from "./groqAdapter.js";

let cached:AsrAdapter|null=null;

export function getAsrAdapter():AsrAdapter{
 if(cached)return cached;
 // Only provider today — Groq's free-tier hosted Whisper. Shaped as an adapter
 // (mirroring translation/ABDM) so a self-hosted or alternate provider can be
 // swapped in later without touching call sites.
 cached=new GroqAsrAdapter();
 return cached;
}

// Test-only escape hatch, mirrors translationAdapter.ts's pattern.
export function setAsrAdapterForTests(adapter:AsrAdapter|null){cached=adapter}
