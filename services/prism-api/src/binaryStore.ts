import {mkdir,writeFile,readFile,access} from "fs/promises"; import {dirname,join} from "path";
const root=process.env.RESOURCE_STORAGE_PATH||"./data/resources";
export async function putBinary(key:string,bytes:Buffer){const path=join(root,key);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);return key}
export async function getBinary(key:string){const path=join(root,key);try{await access(path);return await readFile(path)}catch{return null}}