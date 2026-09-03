import {Pool} from "pg"; import {config} from "./config.js";
export const db=config.databaseUrl?new Pool({connectionString:config.databaseUrl}):null;
export async function query<T=any>(sql:string,params:any[]=[]):Promise<T[]>{if(!db)throw new Error("DATABASE_URL is required for persistent storage");return (await db.query(sql,params)).rows as T[]}