import {db,query} from "../db.js";
const memory=new Set<string>();
export async function ensurePatient(id:string){if(!id)return null;if(!db){memory.add(id);return id}await query("insert into patients(id) values($1::uuid) on conflict (id) do nothing",[id]);return id}
export async function patientExists(id:string){if(!db)return memory.has(id);const rows=await query<{id:string}>("select id from patients where id=$1::uuid",[id]);return !!rows[0]}