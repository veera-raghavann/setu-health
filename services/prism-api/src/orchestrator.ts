import type {IntakeSession} from "./types.js"; import {screenRedFlags} from "./safety.js"; import {questionsFor,recordAnswer,conditions,conditionCards,type ConditionKey} from "./protocolEngine.js";

export const ask=(patient_text:string,options:any[]=[])=>( {type:"ASK",patient_text,input_mode:"BOTH",options} );
export const selectCondition=()=>( {type:"SELECT_CONDITION",patient_text:"What best describes what's troubling you today?",input_mode:"TOUCH",options:conditionCards()} );

export interface OriginalTurn{value:string;language:string}

export function decide(s:IntakeSession,value:string,inputMode:string,original?:OriginalTurn){
 const ctx:any=s.clinicalContext;

 // Step 1: awaiting condition selection (the very first interaction of a session).
 // A valid card tap sets the condition and asks its opening free-text prompt next.
 // Free-typed text here is treated as the opening description itself (falls through
 // below with ctx.condition left unset, later defaulting to "other").
 if(s.nextAction?.type==="SELECT_CONDITION"&&!ctx.condition&&(conditions as any)[value]){
  const key=value as ConditionKey;
  ctx.condition=key;
  ctx.condition_selection={value,input_mode:inputMode,recorded_at:new Date().toISOString()};
  s.clinicalContext=ctx;
  s.nextAction=ask(conditions[key].openingPrompt);
  return s;
 }

 ctx.turns=[...(ctx.turns||[]),{role:"patient",value,inputMode,at:new Date().toISOString(),...(original?{original_value:original.value,original_language:original.language}:{})}];

 if(!ctx.chief_complaint){
  ctx.chief_complaint=value;
  if(original)ctx.chief_complaint_original=original.value;
  if(!ctx.condition)ctx.condition="other";
  const flag=screenRedFlags(value);
  ctx.safety_flag=flag;
  if(flag.level==="emergency"){
   s.state="triage_required";
   s.nextAction={type:"TRIAGE_ALERT",patient_text:"Please wait. A staff member needs to review your symptoms immediately.",input_mode:"NONE",options:[]};
   s.clinicalContext=ctx;
   return s;
  }
 }

 s.clinicalContext=ctx;
 const next=questionsFor(s)[0];
 if(next){
  recordAnswer(s,next.key,value,inputMode);
  const following=questionsFor(s)[0];
  s.nextAction=following?ask(following.text,following.options||[]):{type:"COMPLETE_SECTION",patient_text:"Thank you. Your initial history has been captured.",input_mode:"BOTH",options:[]};
 }else{
  s.state="history";
  s.nextAction={type:"COMPLETE_SECTION",patient_text:"Thank you. Your initial history has been captured.",input_mode:"BOTH",options:[]};
 }
 return s;
}
