import {createHash,randomUUID} from "crypto"; import {registerResource} from "./storage.js"; import {putBinary} from "./binaryStore.js"; import {ensurePatient} from "./repositories/patientRepository.js";

function storageKey(kind:"original"|"processed",sha256:string){
  return `resources/${kind}/${randomUUID()}-${sha256}`;
}

export async function registerUpload(file:{filename:string;mimetype:string;buffer:Buffer},patientId:string|null){
  if(patientId)await ensurePatient(patientId);
  const sha256=createHash("sha256").update(file.buffer).digest("hex");
  const key=storageKey("original",sha256);
  await putBinary(key,file.buffer);
  return registerResource({
    patientId,
    originalFilename:file.filename,
    mediaType:file.mimetype,
    byteSize:file.buffer.length,
    sha256,
    storageKey:key,
    kind:"original",
    parentResourceId:null
  });
}

export async function registerProcessed(input:{parentResourceId:string;filename:string;mediaType:string;bytes:Buffer;patientId:string|null}){
  const sha256=createHash("sha256").update(input.bytes).digest("hex");
  const key=storageKey("processed",sha256);
  await putBinary(key,input.bytes);
  return registerResource({
    patientId:input.patientId,
    originalFilename:input.filename,
    mediaType:input.mediaType,
    byteSize:input.bytes.length,
    sha256,
    storageKey:key,
    kind:"processed",
    parentResourceId:input.parentResourceId
  });
}
