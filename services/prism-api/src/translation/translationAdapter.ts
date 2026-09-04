export interface TranslationResult{text:string;engine:string;confidence?:number}
export interface TranslationAdapter{
 translate(input:{text:string;from:string;to:string}):Promise<TranslationResult>;
}

import {MyMemoryTranslationAdapter} from "./myMemoryAdapter.js";
import {BhashiniTranslationAdapter} from "./bhashiniAdapter.js";
import {PassthroughTranslationAdapter} from "./passthroughAdapter.js";

let cached:TranslationAdapter|null=null;

export function getTranslationAdapter():TranslationAdapter{
 if(cached)return cached;
 const provider=(process.env.TRANSLATION_PROVIDER||"mymemory").toLowerCase();
 cached = provider==="bhashini" ? new BhashiniTranslationAdapter()
  : provider==="none" ? new PassthroughTranslationAdapter()
  : new MyMemoryTranslationAdapter();
 return cached;
}

// Test-only escape hatch: allows tests to swap the cached singleton for a mock adapter.
export function setTranslationAdapterForTests(adapter:TranslationAdapter|null){cached=adapter}

/** "hi-IN" -> "hi", "en" -> "en". Session language is BCP-47-ish; providers expect bare ISO 639-1 codes. */
export function langCode(language:string|undefined|null):string{
 return String(language||"en").split("-")[0].toLowerCase()||"en";
}

/** Translates patient_text and any options[].label in a nextAction; options[].value (machine keys) are left untouched. */
export async function translateAction(action:Record<string,any>,to:string):Promise<Record<string,any>>{
 if(!action||to==="en")return action;
 const adapter=getTranslationAdapter();
 const patient_text = action.patient_text ? (await adapter.translate({text:action.patient_text,from:"en",to})).text : action.patient_text;
 const options = Array.isArray(action.options) ? await Promise.all(action.options.map(async(o:any)=>{
  if(typeof o==="string"){const t=await adapter.translate({text:o,from:"en",to});return t.text}
  if(o&&typeof o==="object"&&typeof o.label==="string"){const t=await adapter.translate({text:o.label,from:"en",to});return {...o,label:t.text}}
  return o;
 })) : action.options;
 return {...action,patient_text,options};
}
