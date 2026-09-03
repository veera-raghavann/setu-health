import {randomUUID} from "crypto";
export interface AuditEvent{ id:string; actorType:"patient"|"clinician"|"system"; actorId:string|null; action:string; resourceId:string|null; patientId:string|null; accessSessionId:string|null; at:string; metadata:Record<string,unknown> }
const events:AuditEvent[]=[];
export function audit(event:Omit<AuditEvent,"id"|"at">){const e={id:randomUUID(),at:new Date().toISOString(),...event};events.push(e);return e}
export function listAuditForResource(resourceId:string){return events.filter(e=>e.resourceId===resourceId)}