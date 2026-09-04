import type {TranslationAdapter,TranslationResult} from "./translationAdapter.js";

/**
 * Default translation provider: MyMemory Translation API (mymemory.translated.net).
 * Free, no signup, no API key, supports the Indian languages this app targets — the
 * right choice while the team's Bhashini sandbox key (already requested) is pending.
 * Fail-open on any error: a translation outage must never block patient intake.
 */
export class MyMemoryTranslationAdapter implements TranslationAdapter{
 async translate({text,from,to}:{text:string;from:string;to:string}):Promise<TranslationResult>{
  if(!text||!text.trim()||from===to)return {text,engine:"passthrough"};
  try{
   const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
   const res=await fetch(url);
   if(!res.ok)return {text,engine:"mymemory-failed"};
   const data:any=await res.json();
   const translated=data?.responseData?.translatedText;
   if(!translated||typeof translated!=="string")return {text,engine:"mymemory-empty"};
   return {text:translated,engine:"mymemory",confidence:data.responseData.match};
  }catch{
   return {text,engine:"mymemory-failed"};
  }
 }
}
