import "dotenv/config"; import Fastify from "fastify"; import cors from "@fastify/cors"; import multipart from "@fastify/multipart"; import {config} from "./config.js"; import {createSession,getSession,saveSession} from "./repositories/intakeRepository.js"; import {decide,selectCondition} from "./orchestrator.js"; import {conditions} from "./protocolEngine.js"; import {draftSummary} from "./summary.js"; import {registerUpload} from "./resourcePipeline.js"; import {getResource} from "./storage.js"; import {getBinary} from "./binaryStore.js"; import {createGrant,revokeGrant} from "./repositories/resourceAccessRepository.js"; import {resolveForClinician} from "./medbridgeBridge.js"; import {HttpOcrWorkerAdapter} from "./ocr/ocrWorkerAdapter.js"; import {processResource} from "./ocr/processingPipeline.js"; import {normalizeCandidate} from "./clinical/normalizeEvidence.js"; import {saveEvidence,listEvidence,getEvidence,updateVerificationStatus} from "./repositories/evidenceRepository.js"; import {evidenceBundle} from "./fhir/bundle.js"; import {requestOtp,verifyOtp,getPatient,updatePatient,addIssue,addRecord} from "./repositories/patientPoolRepository.js"; import {requestMedBridgeConsent,verifyMedBridgeConsent,getMedBridgeContext,reconcileMedBridgeSession,getContextByHealthId} from "./repositories/medbridgeRepository.js"; import {getTranslationAdapter,translateAction,langCode} from "./translation/translationAdapter.js"; import {getAbdmAdapter} from "../../abdm/abdmAdapter.js"; import {getAsrAdapter} from "./asr/asrAdapter.js"; import {prakritiQuestions,resolveDoshaAnswers,scorePrakriti} from "./ayush/prakritiQuestionnaire.js"; import {agniQuestions,kosthaQuestion,scoreAgni,scoreKoshtha} from "./ayush/agniKosthaQuestionnaire.js"; import {checkPrakritiAgniCorrelation} from "./ayush/correlationRules.js"; import {getAssessment,savePatientQuestionnaire,saveClinicalAssessment} from "./repositories/ayurvedicAssessmentRepository.js";
const app=Fastify({logger:true}); await app.register(cors,{origin:true,methods:["GET","HEAD","POST","PATCH","PUT","DELETE"]}); await app.register(multipart,{limits:{fileSize:25*1024*1024,files:1}});
app.post("/v1/abha/otp/request",async(req:any,res)=>{const mobile=String(req.body?.mobile||"").trim();if(!/^[0-9+ -]{8,18}$/.test(mobile))return res.code(400).send({error:"valid_mobile_required"});return requestOtp(mobile)});
app.post("/v1/abha/otp/verify",async(req:any,res)=>{try{return await verifyOtp(req.body?.transaction_id,req.body?.otp)}catch(e:any){return res.code(401).send({error:e.message||"otp_verification_failed"})}});
app.get("/v1/abha/patients/:id",async(req:any,res)=>{const p=await getPatient(req.params.id);return p||res.code(404).send({error:"patient_not_found"})});
app.patch("/v1/abha/patients/:id/profile",async(req:any,res)=>{try{return await updatePatient(req.params.id,{...(req.body?.full_name?{fullName:req.body.full_name}:{}),profile:req.body?.profile||{}})}catch(e:any){return res.code(404).send({error:e.message})}});
app.post("/v1/abha/patients/:id/issues",async(req:any,res)=>{try{return await addIssue(req.params.id,req.body||{})}catch(e:any){return res.code(404).send({error:e.message})}});
app.post("/v1/abha/patients/:id/records",async(req:any,res)=>{try{return await addRecord(req.params.id,req.body||{})}catch(e:any){return res.code(404).send({error:e.message})}});
app.get("/v1/medbridge/patients/:id/context",async(req:any,res)=>{try{return await getContextByHealthId(req.params.id)}catch(e:any){return res.code(404).send({error:e.message})}});
app.post("/v1/medbridge/consent/request",async(req:any,res)=>{try{return await requestMedBridgeConsent(req.body||{})}catch(e:any){return res.code(e.message==="citizen_not_found"?404:400).send({error:e.message})}});
app.post("/v1/medbridge/consent/verify",async(req:any,res)=>{try{return await verifyMedBridgeConsent(req.body||{})}catch(e:any){return res.code(401).send({error:e.message})}});
app.get("/v1/medbridge/sessions/:id/context",async(req:any,res)=>{try{return await getMedBridgeContext(req.params.id)}catch(e:any){return res.code(403).send({error:e.message})}});
app.post("/v1/medbridge/sessions/:id/reconcile",async(req:any,res)=>{try{return await reconcileMedBridgeSession(req.params.id)}catch(e:any){return res.code(403).send({error:e.message})}});
app.post("/v1/medbridge/sessions/:id/evidence/:evidenceId/confirm",async(req:any,res)=>{try{const ctx=await getMedBridgeContext(req.params.id);const evidence=await getEvidence(req.params.evidenceId);if(!evidence)return res.code(404).send({error:"evidence_not_found"});if(evidence.patientId!==ctx.patient.patient_id)return res.code(403).send({error:"evidence_does_not_belong_to_consented_patient"});return await updateVerificationStatus(req.params.evidenceId,"clinician_confirmed")}catch(e:any){return res.code(403).send({error:e.message})}});
app.get("/health",async()=>({status:"ok",service:"prism-api",persistence:config.databaseUrl?"postgresql":"development-memory",medbridge:"enabled",translation:(process.env.TRANSLATION_PROVIDER||"mymemory"),abdm:(process.env.ABDM_PROVIDER||"simulated"),asr:(process.env.GROQ_API_KEY?"groq":"not_configured")}));
app.post("/v1/asr/transcribe",async(req:any,res)=>{const file=await req.file();if(!file)return res.code(400).send({error:"file_required"});const buffer=await file.toBuffer();const language=(req.query as any)?.language;try{return await getAsrAdapter().transcribe({buffer,mimeType:file.mimetype,filename:file.filename||"speech.webm",languageHint:language?langCode(language):undefined})}catch(err:any){return res.code(502).send({error:err?.message||"transcription_failed"})}});
app.post("/v1/intake/sessions",async(req:any)=>{const b=req.body||{};const s=await createSession({patientId:b.patient_id||null,language:b.language,entryPoint:b.entry_point,pathway:b.pathway,nextAction:selectCondition()});const lang=langCode(s.language);if(lang!=="en")s.nextAction=await translateAction(s.nextAction as any,lang);return s});
app.get("/v1/intake/sessions/:id",async(req:any,res)=>{const s=await getSession(req.params.id);return s||res.code(404).send({error:"session_not_found"})});
app.post("/v1/intake/sessions/:id/responses",async(req:any,res)=>{
 const s=await getSession(req.params.id);if(!s)return res.code(404).send({error:"session_not_found"});
 const rawValue=req.body?.value;if(!rawValue)return res.code(400).send({error:"value_required"});
 const lang=langCode(s.language);
 const isConditionKeyTap=s.nextAction?.type==="SELECT_CONDITION"&&Object.prototype.hasOwnProperty.call(conditions,rawValue);
 let value=rawValue,original:{value:string;language:string}|undefined;
 if(lang!=="en"&&!isConditionKeyTap){
  const t=await getTranslationAdapter().translate({text:rawValue,from:lang,to:"en"});
  value=t.text;original={value:rawValue,language:lang};
 }
 decide(s,value,req.body?.input_mode||"text",original);
 if(lang!=="en"&&s.nextAction)s.nextAction=await translateAction(s.nextAction as any,lang);
 return saveSession(s);
});
app.get("/v1/intake/sessions/:id/summary",async(req:any,res)=>{const s=await getSession(req.params.id);return s?draftSummary(s):res.code(404).send({error:"session_not_found"})});
app.post("/v1/intake/sessions/:id/evidence",async(req:any,res)=>{const s=await getSession(req.params.id);if(!s)return res.code(404).send({error:"session_not_found"});const ctx:any=s.clinicalContext;ctx.linked_resources=[...(ctx.linked_resources||[]),{resource_id:req.body?.resource_id,evidence_ids:req.body?.evidence_ids||[],original_filename:req.body?.original_filename,linked_at:new Date().toISOString()}];s.clinicalContext=ctx;return saveSession(s)});
app.post("/v1/resources/upload",async(req:any,res)=>{const file=await req.file();if(!file)return res.code(400).send({error:"file_required"});const buffer=await file.toBuffer();const patientId=(req.query as any)?.patient_id||null;return {resource:await registerUpload({filename:file.filename,mimetype:file.mimetype,buffer},patientId),status:"registered",next:"processing_pending"}});
app.get("/v1/resources/:id",async(req:any,res)=>{const resource=await getResource(req.params.id);return resource||res.code(404).send({error:"resource_not_found"})});
app.get("/v1/resources/:id/download",async(req:any,res)=>{const resource=await getResource(req.params.id);if(!resource)return res.code(404).send({error:"resource_not_found"});const bytes=await getBinary(resource.storageKey);if(!bytes)return res.code(404).send({error:"binary_not_found"});res.type(resource.mediaType);return res.send(bytes)});
app.post("/v1/resources/:id/process",async(req:any,res)=>{const resource=await getResource(req.params.id);if(!resource)return res.code(404).send({error:"resource_not_found"});try{const bytes=await getBinary(resource.storageKey);const result=await processResource(new HttpOcrWorkerAdapter(),{resourceId:resource.resourceId,mediaType:resource.mediaType,bytes:bytes||undefined});if(result.status!=="completed")return result;const evidence=[];for(const candidate of result.evidence){try{const normalized=normalizeCandidate(candidate,{patientId:resource.patientId,resourceId:resource.resourceId,originalResourceId:resource.kind==="original"?resource.resourceId:resource.parentResourceId||undefined});evidence.push(await saveEvidence(normalized))}catch(err:any){app.log.warn({err},"evidence persistence failed; preserving OCR result for inspection")}}return {...result,evidence}}catch(err:any){app.log.error({err},"document processing failed");return res.code(502).send({status:"failed",error:err?.message||"processing_failed"})}});
app.get("/v1/patients/:patientId/evidence",async(req:any)=>listEvidence(req.params.patientId,req.query?.category));
app.post("/v1/patients/:patientId/evidence/:evidenceId/confirm",async(req:any,res)=>{const evidence=await getEvidence(req.params.evidenceId);if(!evidence)return res.code(404).send({error:"evidence_not_found"});if(evidence.patientId!==req.params.patientId)return res.code(403).send({error:"evidence_does_not_belong_to_patient"});return await updateVerificationStatus(req.params.evidenceId,"patient_confirmed")});
app.delete("/v1/patients/:patientId/evidence/:evidenceId",async(req:any,res)=>{const evidence=await getEvidence(req.params.evidenceId);if(!evidence)return res.code(404).send({error:"evidence_not_found"});if(evidence.patientId!==req.params.patientId)return res.code(403).send({error:"evidence_does_not_belong_to_patient"});return await updateVerificationStatus(req.params.evidenceId,"unverified")});
app.get("/v1/patients/:patientId/fhir-bundle",async(req:any)=>evidenceBundle(req.params.patientId,await listEvidence(req.params.patientId)));
app.post("/v1/resources/:id/access-grants",async(req:any,res)=>{const b=req.body||{};return createGrant({resourceId:req.params.id,patientId:b.patient_id||null,audience:"medbridge_clinician",purpose:b.purpose||"clinical_review",consentReference:b.consent_reference||null,accessSessionId:b.access_session_id||null,expiresAt:b.expires_at||new Date(Date.now()+30*60*1000).toISOString(),createdBy:b.created_by||null})});
app.delete("/v1/resource-access-grants/:grantId",async(req:any,res)=>{const grant=await revokeGrant(req.params.grantId);return grant||res.code(404).send({error:"grant_not_found"})});
app.post("/v1/medbridge/resources/:id/resolve",async(req:any,res)=>{const b=req.body||{};const result=await resolveForClinician(req.params.id,{accessSessionId:b.access_session_id,patientId:b.patient_id,clinicianId:b.clinician_id});return result.allowed?result:res.code(403).send(result)});
app.post("/v1/abdm/push",async(req:any,res)=>{
 const b=req.body||{};const evidenceId=b.evidence_id;const patientId=b.patient_id;const abhaId=b.abha_id;const hiu=b.hiu||"demo-hospital";
 if(!evidenceId||!patientId||!abhaId)return res.code(400).send({error:"evidence_id_patient_id_and_abha_id_required"});
 const evidence=await getEvidence(evidenceId);
 if(!evidence)return res.code(404).send({error:"evidence_not_found"});
 if(evidence.patientId!==patientId)return res.code(403).send({error:"evidence_does_not_belong_to_patient"});
 const adapter=getAbdmAdapter();
 const link=await adapter.linkCareContext({patientId,abhaId,resourceRefs:[evidence.id]});
 const consent=await adapter.requestConsent({patientId,purpose:"care_management",hiu});
 const bundle=evidenceBundle(patientId,[evidence]);
 const result=await adapter.pushHealthInformation({consentRequestId:consent.consentRequestId,patientId,fhirBundle:bundle,verificationStatus:evidence.verificationStatus});
 return {link,consent,result};
});
app.get("/v1/ayush/questionnaire",async()=>({prakritiQuestions,agniQuestions,kosthaQuestion}));
app.post("/v1/ayush/patients/:patientId/questionnaire",async(req:any)=>{
 const b=req.body||{};const patientId=req.params.patientId;const now=new Date().toISOString();
 const {scores,primary}=scorePrakriti(resolveDoshaAnswers(b.prakriti_answers||{}));
 const agniType=scoreAgni(b.agni_answers||[]);
 const kosthaType=scoreKoshtha(b.koshtha_answer||"");
 const alerts=checkPrakritiAgniCorrelation(scores,agniType);
 return savePatientQuestionnaire(patientId,{
  prakriti:{primary,scores,source:"patient_questionnaire",assessedAt:now},
  agni:{type:agniType,source:"patient_questionnaire",assessedAt:now},
  koshtha:{type:kosthaType,source:"patient_questionnaire",assessedAt:now},
  mala:{purisha:b.mala?.purisha,mutra:b.mala?.mutra,sweda:b.mala?.sweda,source:"patient_questionnaire",assessedAt:now},
  alerts
 });
});
app.get("/v1/ayush/patients/:patientId/assessment",async(req:any,res)=>{const a=await getAssessment(req.params.patientId);return a||res.code(404).send({error:"assessment_not_found"})});
app.post("/v1/medbridge/sessions/:id/ayush/clinical",async(req:any,res)=>{
 try{
  const ctx=await getMedBridgeContext(req.params.id);
  const b=req.body||{};const now=new Date().toISOString();const patch:any={};
  if(b.vikriti)patch.vikriti={vataVitiation:!!b.vikriti.vata_vitiation,pittaVitiation:!!b.vikriti.pitta_vitiation,kaphaVitiation:!!b.vikriti.kapha_vitiation,notes:b.vikriti.notes,assessedBy:"clinician",assessedAt:now};
  if(b.dhatu)patch.dhatu={...b.dhatu,assessedBy:"clinician",assessedAt:now};
  if(b.trividha_pariksha)patch.trividhaPariksha={...b.trividha_pariksha,assessedBy:"clinician",assessedAt:now};
  if(b.ashtavidha_pariksha)patch.ashtavidhaPariksha={...b.ashtavidha_pariksha,assessedBy:"clinician",assessedAt:now};
  return await saveClinicalAssessment(ctx.patient.patient_id,patch);
 }catch(e:any){return res.code(403).send({error:e.message})}
});
await app.listen({port:config.port,host:"0.0.0.0"});
