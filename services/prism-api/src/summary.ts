import type {IntakeSession} from "./types.js";
export function draftSummary(s:IntakeSession){
 const c:any=s.clinicalContext;
 return{
  status:"draft_not_clinician_verified",
  pathway:s.pathway,
  condition:c.condition||null,
  chief_complaint:c.chief_complaint||null,
  chief_complaint_original:c.chief_complaint_original||null,
  history_answers:c.answers||[],
  turns:c.turns||[],
  linked_resources:c.linked_resources||[],
  provenance:{source_type:"patient_reported",session_id:s.id},
  notice:"This is an intake draft for clinician review and is not a diagnosis."
 };
}