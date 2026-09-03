import type {IntakeSession} from "./types.js";
export interface ProtocolQuestion{key:string;text:string;options?:string[];required:boolean}
const common:ProtocolQuestion[]=[
 {key:"onset",text:"When did this problem first begin?",required:true},
 {key:"progression",text:"How has it changed since it began?",required:true},
 {key:"associated_symptoms",text:"Have you noticed any other symptoms?",required:false},
 {key:"severity",text:"How severe is it right now?",options:["Mild","Moderate","Severe","Unable to say"],required:true}
];
export function questionsFor(session:IntakeSession):ProtocolQuestion[]{const ctx:any=session.clinicalContext;const answered=new Set((ctx.answers||[]).map((a:any)=>a.key));return common.filter(q=>!answered.has(q.key))}
export function recordAnswer(session:IntakeSession,key:string,value:string,inputMode:string){const ctx:any=session.clinicalContext;ctx.answers=[...(ctx.answers||[]),{key,value,input_mode:inputMode,recorded_at:new Date().toISOString()}];session.clinicalContext=ctx;return session}