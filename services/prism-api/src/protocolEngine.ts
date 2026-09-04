import type {IntakeSession} from "./types.js";
export interface ProtocolQuestion{key:string;text:string;options?:string[];required:boolean}
export type ConditionKey="fever"|"stomach_pain"|"cough_cold"|"headache"|"body_ache_injury"|"skin_issue"|"other";
export interface ConditionDef{key:ConditionKey;label:string;icon:string;openingPrompt:string;questions:ProtocolQuestion[]}

const severity:ProtocolQuestion={key:"severity",text:"How severe is it right now?",options:["Mild","Moderate","Severe","Unable to say"],required:true};

const genericQuestions:ProtocolQuestion[]=[
 {key:"onset",text:"When did this problem first begin?",required:true},
 {key:"progression",text:"How has it changed since it began?",required:true},
 {key:"associated_symptoms",text:"Have you noticed any other symptoms?",required:false},
 severity
];

export const conditions:Record<ConditionKey,ConditionDef>={
 fever:{key:"fever",label:"Fever",icon:"🌡️",openingPrompt:"Tell me more about the fever, in your own words.",questions:[
  {key:"onset",text:"When did the fever start?",required:true},
  {key:"pattern",text:"Does the fever stay constant, or does it come and go?",options:["Continuous","Comes and goes","Only at night","Not sure"],required:true},
  {key:"associated_symptoms",text:"Any chills, body ache, rash, or cough along with the fever?",required:false},
  severity
 ]},
 stomach_pain:{key:"stomach_pain",label:"Stomach pain",icon:"🤢",openingPrompt:"Tell me more about the stomach pain, in your own words.",questions:[
  {key:"onset",text:"When did the pain start?",required:true},
  {key:"location",text:"Where is the pain mainly located?",options:["Upper abdomen","Lower abdomen","Whole abdomen","Comes and goes across areas"],required:true},
  {key:"character",text:"How would you describe the pain?",options:["Cramping","Burning","Sharp/stabbing","Dull ache"],required:false},
  {key:"aggravating_relieving",text:"Does eating make it better or worse?",options:["Worse after eating","Better after eating","No relation","Not sure"],required:false},
  severity
 ]},
 cough_cold:{key:"cough_cold",label:"Cough & cold",icon:"🤧",openingPrompt:"Tell me more about the cough or cold, in your own words.",questions:[
  {key:"onset",text:"When did it start?",required:true},
  {key:"character",text:"Which best describes it?",options:["Dry cough","Cough with mucus","Blocked/runny nose","Sore throat"],required:true},
  {key:"trend",text:"Is it getting better, getting worse, or about the same?",options:["Getting worse","Getting better","Same for days"],required:false},
  {key:"associated_symptoms",text:"Any fever, breathlessness, or chest pain along with this?",required:false},
  severity
 ]},
 headache:{key:"headache",label:"Headache",icon:"🤕",openingPrompt:"Tell me more about the headache, in your own words.",questions:[
  {key:"onset",text:"When did the headache start?",required:true},
  {key:"location",text:"Where is the pain?",options:["One side","Both sides","Back of head","All over"],required:false},
  {key:"character",text:"What does it feel like?",options:["Throbbing","Pressure/tight band","Sharp","Dull"],required:false},
  {key:"triggers",text:"Anything that brings it on or makes it worse?",required:false},
  severity
 ]},
 body_ache_injury:{key:"body_ache_injury",label:"Body ache / injury",icon:"🦴",openingPrompt:"Tell me more about the body ache or injury, in your own words.",questions:[
  {key:"onset",text:"When did it start?",required:true},
  {key:"location",text:"Which part of the body is affected?",required:true},
  {key:"mechanism",text:"How did this happen?",options:["Fall/accident","Overuse/strain","No clear cause","Existing condition flare-up"],required:false},
  {key:"aggravating_relieving",text:"Is it worse with movement, worse at rest, or no difference?",options:["Worse with movement","Worse at rest","No difference"],required:false},
  severity
 ]},
 skin_issue:{key:"skin_issue",label:"Skin issue",icon:"🩹",openingPrompt:"Tell me more about the skin issue, in your own words.",questions:[
  {key:"onset",text:"When did you first notice it?",required:true},
  {key:"appearance",text:"Which best describes it?",options:["Rash","Itching without rash","Swelling","Wound not healing"],required:true},
  {key:"spread",text:"Is it staying in one place or spreading?",options:["Localized to one area","Spreading","Appeared in multiple places at once"],required:false},
  {key:"associated_symptoms",text:"Any fever, pain, or discharge along with it?",required:false},
  severity
 ]},
 other:{key:"other",label:"Something else",icon:"❓",openingPrompt:"Please tell me, in your own words, what is troubling you today.",questions:genericQuestions}
};

export const conditionCards=()=>Object.values(conditions).map(c=>({value:c.key,label:`${c.icon} ${c.label}`}));

export function questionsFor(session:IntakeSession):ProtocolQuestion[]{
 const ctx:any=session.clinicalContext;
 const key:ConditionKey=(ctx.condition&&conditions[ctx.condition as ConditionKey])?ctx.condition:"other";
 const set=conditions[key].questions;
 const answered=new Set((ctx.answers||[]).map((a:any)=>a.key));
 return set.filter(q=>!answered.has(q.key));
}

export function recordAnswer(session:IntakeSession,key:string,value:string,inputMode:string){
 const ctx:any=session.clinicalContext;
 ctx.answers=[...(ctx.answers||[]),{key,value,input_mode:inputMode,recorded_at:new Date().toISOString()}];
 session.clinicalContext=ctx;
 return session;
}
