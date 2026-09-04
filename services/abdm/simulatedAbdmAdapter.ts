import {randomUUID} from "crypto";
import type {AbdmAdapter,CareContextLink,ConsentRequest,PushResult} from "./abdmAdapter.js";
import {ELIGIBLE_PUSH_STATUSES} from "./abdmAdapter.js";

/**
 * Demo-safe default: simulates the shape and timing of ABDM's HIP-side care-context
 * linking and consent-gated data exchange, without a real sandbox registration.
 * Every result is explicitly engine:"simulated" so the UI can label it as such —
 * the same convention already used throughout this repo for demo OTP/consent flows.
 * Swap ABDM_PROVIDER=sandbox once real credentials are available; no caller changes needed.
 */
const links=new Map<string,CareContextLink>();
const consents=new Map<string,ConsentRequest>();

export class SimulatedAbdmAdapter implements AbdmAdapter{
 async linkCareContext({patientId,abhaId}:{patientId:string;abhaId:string;resourceRefs:string[]}):Promise<CareContextLink>{
  const link:CareContextLink={careContextId:randomUUID(),patientId,abhaId,linkedAt:new Date().toISOString(),status:"linked"};
  links.set(link.careContextId,link);
  return link;
 }

 async requestConsent({patientId,purpose,hiu}:{patientId:string;purpose:string;hiu:string}):Promise<ConsentRequest>{
  const consent:ConsentRequest={consentRequestId:randomUUID(),patientId,purpose,hiu,status:"granted",createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30*60*1000).toISOString()};
  consents.set(consent.consentRequestId,consent);
  return consent;
 }

 async checkConsentStatus(consentRequestId:string):Promise<ConsentRequest>{
  const consent=consents.get(consentRequestId);
  if(!consent)throw new Error("consent_request_not_found");
  return consent;
 }

 async pushHealthInformation({consentRequestId,verificationStatus}:{consentRequestId:string;patientId:string;fhirBundle:unknown;verificationStatus:string}):Promise<PushResult>{
  if(!ELIGIBLE_PUSH_STATUSES.includes(verificationStatus)){
   return {status:"rejected",reason:`evidence at verificationStatus="${verificationStatus}" is not eligible — it must be patient_confirmed or clinician_confirmed first`,engine:"simulated"};
  }
  const consent=consents.get(consentRequestId);
  if(!consent||consent.status!=="granted"){
   return {status:"rejected",reason:"no active granted consent for this request",engine:"simulated"};
  }
  return {status:"pushed",pushedAt:new Date().toISOString(),engine:"simulated"};
 }
}
