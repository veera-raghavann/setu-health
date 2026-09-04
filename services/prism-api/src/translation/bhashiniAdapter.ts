import type {TranslationAdapter,TranslationResult} from "./translationAdapter.js";

/**
 * Target production provider (SIH problem statement names Bhashini/AI4Bharat explicitly).
 * The team has registered for sandbox access; this stub is ready to fill in once
 * BHASHINI_API_KEY / BHASHINI_PIPELINE_URL are issued. Until then it fails loudly
 * rather than silently no-op'ing, so a misconfigured TRANSLATION_PROVIDER=bhashini
 * is caught immediately instead of masquerading as working translation.
 */
export class BhashiniTranslationAdapter implements TranslationAdapter{
 async translate(_input:{text:string;from:string;to:string}):Promise<TranslationResult>{
  const key=process.env.BHASHINI_API_KEY; const pipelineUrl=process.env.BHASHINI_PIPELINE_URL;
  if(!key||!pipelineUrl){
   throw new Error("BHASHINI_API_KEY/BHASHINI_PIPELINE_URL not configured — Bhashini sandbox access is pending. Set TRANSLATION_PROVIDER=mymemory (default) or =none until it arrives.");
  }
  // TODO(bhashini): implement once sandbox credentials are issued. The Bhashini pipeline
  // API (NMT task via the /services/inference/pipeline endpoint) takes a pipeline config
  // + input array and returns translated segments — verify the exact contract against the
  // current Bhashini API docs before wiring this up, per docs/abdm/README.md's rule of not
  // hard-coding undocumented endpoint assumptions.
  throw new Error("Bhashini adapter not yet implemented — sandbox credentials not available at plan time.");
 }
}
