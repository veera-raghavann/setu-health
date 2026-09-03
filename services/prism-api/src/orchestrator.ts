import type {IntakeSession} from "./types.js";import {beginConversation,processPatientInput} from "./conversation/engine.js";
export const ask=(patient_text:string,options:any[]=[])=>({type:"ASK",patient_text,input_mode:"BOTH",options});
export function start(s:IntakeSession){const d=beginConversation(s);s.state=d.state;s.nextAction=d.nextAction;return s}
export async function decide(s:IntakeSession,value:string,inputMode:string){const d=await processPatientInput(s,value,inputMode as any);s.state=d.state;s.nextAction=d.nextAction;return s}