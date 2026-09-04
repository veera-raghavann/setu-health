import type {TranslationAdapter,TranslationResult} from "./translationAdapter.js";

/** No-op adapter for TRANSLATION_PROVIDER=none and tests — returns input text unchanged. */
export class PassthroughTranslationAdapter implements TranslationAdapter{
 async translate({text}:{text:string;from:string;to:string}):Promise<TranslationResult>{
  return {text,engine:"none"};
 }
}
