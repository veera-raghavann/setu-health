export type EvidenceSource="patient_reported"|"uploaded_document"|"abdm_exchange"|"clinician_confirmed";
export type CarePathway="allopathy"|"ayush"|"mixed"|"unknown";
export type VerificationStatus="unverified"|"source_extracted"|"patient_confirmed"|"clinician_confirmed";
export type ResourceAudience="patient"|"medbridge_clinician";
export interface IntakeSession{ id:string; patientId:string|null; language:string; entryPoint:string; state:string; pathway:CarePathway; clinicalContext:Record<string,any>; nextAction:Record<string,unknown>; createdAt:string; updatedAt:string; }