export interface CareContextLink{careContextId:string;patientId:string;abhaId:string;linkedAt:string;status:"linked"|"pending"}
export interface ConsentRequest{consentRequestId:string;patientId:string;purpose:string;hiu:string;status:"requested"|"granted"|"denied"|"expired";createdAt:string;expiresAt?:string}
export interface PushResult{status:"pushed"|"rejected";reason?:string;pushedAt?:string;engine:string}

export interface AbdmAdapter{
 linkCareContext(input:{patientId:string;abhaId:string;resourceRefs:string[]}):Promise<CareContextLink>;
 requestConsent(input:{patientId:string;purpose:string;hiu:string}):Promise<ConsentRequest>;
 checkConsentStatus(consentRequestId:string):Promise<ConsentRequest>;
 pushHealthInformation(input:{consentRequestId:string;patientId:string;fhirBundle:unknown;verificationStatus:string}):Promise<PushResult>;
}

import {SimulatedAbdmAdapter} from "./simulatedAbdmAdapter.js";
import {SandboxAbdmAdapter} from "./sandboxAbdmAdapter.js";

/** Evidence must reach at least patient review, ideally clinician confirmation, before it is
 * ever a candidate for the ABDM push path — raw OCR guesses (source_extracted) are never eligible. */
export const ELIGIBLE_PUSH_STATUSES=["patient_confirmed","clinician_confirmed"];

let cached:AbdmAdapter|null=null;

export function getAbdmAdapter():AbdmAdapter{
 if(cached)return cached;
 const provider=(process.env.ABDM_PROVIDER||"simulated").toLowerCase();
 cached = provider==="sandbox" ? new SandboxAbdmAdapter() : new SimulatedAbdmAdapter();
 return cached;
}

// Test-only escape hatch, mirrors translationAdapter.ts's pattern.
export function setAbdmAdapterForTests(adapter:AbdmAdapter|null){cached=adapter}
