import type {AbdmAdapter,CareContextLink,ConsentRequest,PushResult} from "./abdmAdapter.js";

/**
 * Real ABDM sandbox integration (sandbox.abdm.gov.in) — team is not yet registered.
 * Once ABDM_CLIENT_ID / ABDM_CLIENT_SECRET / certificate paths are issued, implement here:
 *  - Gateway session token exchange
 *  - HIP care-context linking (link/init + link/confirm)
 *  - HIU consent request + Consent Manager callback handling
 *  - Data-flow push with ECDH-derived, AES-GCM encrypted FHIR payloads
 * Verify every endpoint, header, and payload shape against the current official ABDM
 * sandbox documentation before implementing — per docs/abdm/README.md's rule against
 * hard-coding undocumented endpoint assumptions. Do not guess the contract.
 */
export class SandboxAbdmAdapter implements AbdmAdapter{
 private assertConfigured(){
  if(!process.env.ABDM_CLIENT_ID||!process.env.ABDM_CLIENT_SECRET){
   throw new Error("ABDM_CLIENT_ID/ABDM_CLIENT_SECRET not configured — ABDM sandbox registration is pending. Set ABDM_PROVIDER=simulated (default) until credentials are available.");
  }
 }
 async linkCareContext():Promise<CareContextLink>{this.assertConfigured();throw new Error("Sandbox ABDM care-context linking not yet implemented.")}
 async requestConsent():Promise<ConsentRequest>{this.assertConfigured();throw new Error("Sandbox ABDM consent request not yet implemented.")}
 async checkConsentStatus():Promise<ConsentRequest>{this.assertConfigured();throw new Error("Sandbox ABDM consent status check not yet implemented.")}
 async pushHealthInformation():Promise<PushResult>{this.assertConfigured();throw new Error("Sandbox ABDM data push not yet implemented.")}
}
