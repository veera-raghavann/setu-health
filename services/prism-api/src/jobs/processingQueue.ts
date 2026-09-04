import {randomUUID} from "crypto";
export type JobStatus="queued"|"processing"|"completed"|"failed";
export interface ProcessingJob{id:string;resourceId:string;status:JobStatus;attempt:number;error?:string;createdAt:string;updatedAt:string}
const jobs=new Map<string,ProcessingJob>();const pending:string[]=[];
export function enqueue(resourceId:string){const now=new Date().toISOString();const job={id:randomUUID(),resourceId,status:"queued" as JobStatus,attempt:0,createdAt:now,updatedAt:now};jobs.set(job.id,job);pending.push(job.id);return job}
export function next(){const id=pending.shift();if(!id)return null;const j=jobs.get(id)!;j.status="processing";j.attempt++;j.updatedAt=new Date().toISOString();return j}
export function complete(id:string){const j=jobs.get(id);if(j){j.status="completed";j.updatedAt=new Date().toISOString()}return j||null}
export function fail(id:string,error:string,retry=true){const j=jobs.get(id);if(!j)return null;j.error=error;j.status="failed";j.updatedAt=new Date().toISOString();if(retry&&j.attempt<3){j.status="queued";pending.push(id)}return j}
export function getJob(id:string){return jobs.get(id)||null}