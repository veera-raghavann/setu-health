import {randomUUID} from "crypto";
import type {AyurvedicAssessment} from "../../../../packages/clinical-schema/src/ayush.js";

// Dev-memory store, mirroring the pattern used by patientPoolRepository.ts —
// one assessment per patient, keyed by patientId (not assessment id).
const memory=new Map<string,AyurvedicAssessment>();

export async function getAssessment(patientId:string):Promise<AyurvedicAssessment|null>{
 return memory.get(patientId)||null;
}

async function upsert(patientId:string,patch:Partial<AyurvedicAssessment>):Promise<AyurvedicAssessment>{
 const now=new Date().toISOString();
 const existing=memory.get(patientId);
 const next:AyurvedicAssessment=existing
  ?{...existing,...patch,alerts:patch.alerts??existing.alerts,updatedAt:now}
  :{id:randomUUID(),patientId,alerts:[],createdAt:now,updatedAt:now,...patch};
 memory.set(patientId,next);
 return next;
}

export async function savePatientQuestionnaire(patientId:string,patch:Partial<Pick<AyurvedicAssessment,"prakriti"|"agni"|"koshtha"|"mala"|"alerts">>):Promise<AyurvedicAssessment>{
 return upsert(patientId,patch);
}

export async function saveClinicalAssessment(patientId:string,patch:Partial<Pick<AyurvedicAssessment,"vikriti"|"dhatu"|"trividhaPariksha"|"ashtavidhaPariksha">>):Promise<AyurvedicAssessment>{
 return upsert(patientId,patch);
}
