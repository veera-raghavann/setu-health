import type {ClinicalEvidence} from "../../../../packages/clinical-schema/src/evidence.js";
export function toFhir(e:ClinicalEvidence):Record<string,unknown>|null{const base={id:e.id,status:"final",subject:{reference:`Patient/${e.patientId||"unknown"}`},meta:{profile:["https://setu.health/fhir/StructureDefinition/provenance-aware-evidence"]},extension:[{url:"https://setu.health/fhir/StructureDefinition/source-resource",valueString:e.sourcePointers.map(p=>p.resourceId).join(",")}]} as any;
switch(e.category){
case "allergy": return {...base,resourceType:"AllergyIntolerance",clinicalStatus:{text:e.verificationStatus},code:e.data};
case "medication": return {...base,resourceType:"MedicationStatement",medicationCodeableConcept:e.data,effectiveDateTime:e.occurredAt};
case "diagnosis": return {...base,resourceType:"Condition",code:e.data,recordedDate:e.recordedAt};
case "lab_result": return {...base,resourceType:"Observation",category:[{text:"laboratory"}],code:e.data,effectiveDateTime:e.occurredAt};
case "vital": return {...base,resourceType:"Observation",category:[{text:"vital-signs"}],code:e.data,effectiveDateTime:e.occurredAt};
case "immunization": return {...base,resourceType:"Immunization",vaccineCode:e.data,occurrenceDateTime:e.occurredAt};
case "discharge_summary": return {...base,resourceType:"DocumentReference",description:"PRISM extracted discharge summary",content:e.sourcePointers.map(p=>({attachment:{url:`Resource/${p.resourceId}`}}))};
case "procedure": return {...base,resourceType:"Procedure",code:e.data,performedDateTime:e.occurredAt};
default:return null}}