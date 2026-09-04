import type {IntakeSession} from "./types.js";import {localized} from "./conversation/language.js";
export interface ProtocolQuestion{key:string;text:string;options?:string[];required:boolean}
export function questionsFor(session:IntakeSession):ProtocolQuestion[]{const ctx:any=session.clinicalContext||{};const answered=new Set((ctx.answers||[]).map((a:any)=>a.key));const q:ProtocolQuestion[]=[
{key:"onset",text:localized(session.language,"onset","When did this problem first begin?"),required:true},
{key:"progression",text:localized(session.language,"progression","How has it changed since it began?"),required:true},
{key:"associated_symptoms",text:localized(session.language,"associated_symptoms","Have you noticed any other symptoms?"),required:false},
{key:"severity",text:localized(session.language,"severity","How severe is it right now?"),options:["mild","moderate","severe","unable"].map(k=>localized(session.language,k,k)),required:true}];return q.filter(x=>!answered.has(x.key))}
export function recordAnswer(session:IntakeSession,key:string,value:string,inputMode:string){const ctx:any=session.clinicalContext||{};ctx.answers=[...(ctx.answers||[]),{key,value,input_mode:inputMode,origin:"patient_reported",recorded_at:new Date().toISOString()}];session.clinicalContext=ctx;return session}