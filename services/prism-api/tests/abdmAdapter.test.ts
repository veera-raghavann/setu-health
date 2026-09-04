import test from "node:test"; import assert from "node:assert/strict";
import {SimulatedAbdmAdapter} from "../../abdm/simulatedAbdmAdapter.js";

test("simulated adapter rejects a push for evidence that is not yet patient/clinician confirmed",async()=>{
 const a=new SimulatedAbdmAdapter();
 const consent=await a.requestConsent({patientId:"p1",purpose:"care_management",hiu:"demo-hospital"});
 const result=await a.pushHealthInformation({consentRequestId:consent.consentRequestId,patientId:"p1",fhirBundle:{},verificationStatus:"source_extracted"});
 assert.equal(result.status,"rejected");
 assert.match(result.reason||"",/not eligible/);
});

test("simulated adapter links a care context and pushes confirmed evidence under active consent",async()=>{
 const a=new SimulatedAbdmAdapter();
 const link=await a.linkCareContext({patientId:"p1",abhaId:"00-0000-0000-00",resourceRefs:["r1"]});
 assert.equal(link.status,"linked");
 const consent=await a.requestConsent({patientId:"p1",purpose:"care_management",hiu:"demo-hospital"});
 assert.equal(consent.status,"granted");
 const result=await a.pushHealthInformation({consentRequestId:consent.consentRequestId,patientId:"p1",fhirBundle:{},verificationStatus:"clinician_confirmed"});
 assert.equal(result.status,"pushed");
 assert.equal(result.engine,"simulated");
});

test("simulated adapter accepts patient_confirmed evidence too, not just clinician_confirmed",async()=>{
 const a=new SimulatedAbdmAdapter();
 const consent=await a.requestConsent({patientId:"p1",purpose:"care_management",hiu:"demo-hospital"});
 const result=await a.pushHealthInformation({consentRequestId:consent.consentRequestId,patientId:"p1",fhirBundle:{},verificationStatus:"patient_confirmed"});
 assert.equal(result.status,"pushed");
});

test("simulated adapter rejects a push against an unknown consent request",async()=>{
 const a=new SimulatedAbdmAdapter();
 const result=await a.pushHealthInformation({consentRequestId:"does-not-exist",patientId:"p1",fhirBundle:{},verificationStatus:"clinician_confirmed"});
 assert.equal(result.status,"rejected");
});

test("sandbox adapter throws a clear configuration error when unset",async()=>{
 delete process.env.ABDM_CLIENT_ID; delete process.env.ABDM_CLIENT_SECRET;
 const {SandboxAbdmAdapter}=await import("../../abdm/sandboxAbdmAdapter.js");
 await assert.rejects(()=>new SandboxAbdmAdapter().linkCareContext(),/not configured/);
});
