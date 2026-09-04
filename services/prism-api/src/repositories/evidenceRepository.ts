import {randomUUID} from "crypto"; import {query,db} from "../db.js"; import type {ClinicalEvidence} from "../../../../packages/clinical-schema/src/evidence.js";
const memory=new Map<string,ClinicalEvidence>();
export async function saveEvidence(input:Omit<ClinicalEvidence,"id"|"recordedAt">){const evidence:ClinicalEvidence={id:randomUUID(),recordedAt:new Date().toISOString(),...input};memory.set(evidence.id,evidence);
if(db){await query("insert into document_evidence (id,patient_id,resource_id,evidence_kind,value_json,care_pathway,verification_status,source_page,source_text,confidence,category,fhir_resource_type,fhir_projection_status,original_resource_id,source_region) values ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)",[evidence.id,evidence.patientId,evidence.sourcePointers[0]?.resourceId,evidence.category,JSON.stringify(evidence.data),evidence.carePathway,evidence.verificationStatus,evidence.sourcePointers[0]?.page||null,evidence.sourcePointers[0]?.sourceText||null,evidence.sourcePointers[0]?.confidence||null,evidence.category,evidence.fhir?.resourceType||null,evidence.fhir?.projectionStatus||"pending",evidence.sourcePointers[0]?.originalResourceId||null,JSON.stringify(evidence.sourcePointers[0]?.region||null)])}return evidence}
export async function listEvidence(patientId:string|null,category?:string){let rows=[...memory.values()].filter(x=>x.patientId===patientId&&(!category||x.category===category));return rows}
export async function getEvidence(id:string){return memory.get(id)||null}
export async function updateVerificationStatus(id:string,status:ClinicalEvidence["verificationStatus"]){
 const evidence=memory.get(id);
 if(!evidence)return null;
 const updated={...evidence,verificationStatus:status};
 memory.set(id,updated);
 if(db)await query("update document_evidence set verification_status=$2 where id=$1",[id,status]).catch(()=>{});
 return updated;
}