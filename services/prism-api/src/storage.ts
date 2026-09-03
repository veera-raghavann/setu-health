import {randomUUID} from "crypto";
export interface StoredResource{resourceId:string;patientId:string|null;originalFilename:string;mediaType:string;byteSize:number;sha256:string;storageKey:string;kind:"original"|"processed";parentResourceId:string|null;createdAt:string}
const memory=new Map<string,StoredResource>();
export async function registerResource(input:Omit<StoredResource,"resourceId"|"createdAt">){const r:StoredResource={resourceId:randomUUID(),createdAt:new Date().toISOString(),...input};memory.set(r.resourceId,r);return r}
export async function getResource(id:string){return memory.get(id)||null}