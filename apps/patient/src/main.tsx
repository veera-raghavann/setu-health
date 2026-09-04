import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

type Page="home"|"intake"|"profile"|"records"|"abha"|"login";
const API=import.meta.env.VITE_PRISM_API_URL||"http://localhost:8000";

function App(){
 const [page,setPage]=useState<Page>("home");
 const [session,setSession]=useState<any>(null);
 const [summary,setSummary]=useState<any>(null);
 const [listening,setListening]=useState(false);
 const [text,setText]=useState("");
 const [loading,setLoading]=useState(false);
 const [language,setLanguage]=useState("en-IN");
 const [profile,setProfile]=useState<any>({conditions:"",medicines:"",allergies:""});
 const [record,setRecord]=useState<any>(null);
 const [recordStatus,setRecordStatus]=useState("");
 const [error,setError]=useState("");
 const [patient,setPatient]=useState<any>(null);
 const [mobile,setMobile]=useState("");
 const [otp,setOtp]=useState("");
 const [tx,setTx]=useState("");
 const [otpHint,setOtpHint]=useState("");
 const [afterLogin,setAfterLogin]=useState<Page>("abha");
 const [savedIssue,setSavedIssue]=useState(false);
 const [answers,setAnswers]=useState<{question:string;answer:string}[]>([]);
 const inputRef=useRef<HTMLInputElement>(null);

 const request=async(url:string,init?:RequestInit)=>{
  const r=await fetch(API+url,init);
  const d=await r.json().catch(()=>null);
  if(!r.ok)throw new Error(d?.error||d?.message||String(r.status));
  return d;
 };
 const persist=(p:any)=>{
  setPatient(p);
  setProfile(p.profile||{conditions:"",medicines:"",allergies:""});
  localStorage.setItem("setu_patient",JSON.stringify(p));
 };
 const refreshPatient=async(id?:string)=>{
  const patientId=id||patient?.patientId;
  if(!patientId)return null;
  const p=await request("/v1/abha/patients/"+patientId);
  persist(p);
  return p;
 };

 useEffect(()=>{
  const raw=localStorage.getItem("setu_patient");
  if(!raw)return;
  try{
   const cached=JSON.parse(raw);
   setPatient(cached);
   setProfile(cached.profile||{});
   request("/v1/abha/patients/"+cached.patientId).then(persist).catch(()=>{});
  }catch{localStorage.removeItem("setu_patient")}
 },[]);

 const requirePatient=(target:Page)=>{
  if(patient){setPage(target);refreshPatient().catch(()=>{});return true}
  setAfterLogin(target);setPage("login");return false;
 };

 const requestOtp=async()=>{
  setLoading(true);setError("");
  try{
   const r=await request("/v1/abha/otp/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mobile})});
   setTx(r.transaction_id);setOtpHint(r.demo_otp||"");
  }catch(e:any){setError(e.message)}finally{setLoading(false)}
 };

 const verifyOtp=async()=>{
  setLoading(true);setError("");
  try{
   const r=await request("/v1/abha/otp/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transaction_id:tx,otp})});
   persist(r.patient);setPage(afterLogin);setTx("");setOtp("");
  }catch(e:any){setError("Verification failed: "+e.message)}finally{setLoading(false)}
 };

 const start=async()=>{
  if(!patient){setAfterLogin("intake");setPage("login");return}
  setLoading(true);setError("");setSavedIssue(false);setSummary(null);setAnswers([]);
  try{
   const s=await request("/v1/intake/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language,entry_point:"current_health_issue",patient_id:patient.patientId})});
   setSession(s);setPage("intake");
  }catch(e:any){setError(e.message)}finally{setLoading(false)}
 };

 const loadSummary=async(id?:string)=>{
  const sessionId=id||session?.id;
  if(!sessionId)return;
  try{setSummary(await request("/v1/intake/sessions/"+sessionId+"/summary"))}
  catch(e:any){setError(e.message)}
 };

 const completeIssue=async()=>{
  if(!session||!patient||savedIssue)return;
  setLoading(true);setError("");
  try{
   const finalSummary=summary||await request("/v1/intake/sessions/"+session.id+"/summary");
   const updated=await request("/v1/abha/patients/"+patient.patientId+"/issues",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     title:finalSummary.chief_complaint||"Current health issue",
     summary:finalSummary,session_id:session.id,language,
     voice_transcripts:finalSummary.turns||[]
    })
   });
   persist(updated);setSavedIssue(true);setPage("abha");
  }catch(e:any){setError("Could not save the health issue: "+e.message)}
  finally{setLoading(false)}
 };

 const send=async(value:string,mode="text")=>{
  if(!session||!value.trim())return;
  const question=session?.nextAction?.patient_text||"Your response";
  setLoading(true);setError("");
  try{
   const next=await request("/v1/intake/sessions/"+session.id+"/responses",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({value:value.trim(),input_mode:mode})
   });
   setAnswers(prev=>[...prev,{question,answer:value.trim()}]);
   setSession(next);setText("");
   if(next.nextAction?.type==="COMPLETE_SECTION"||next.next_action?.type==="COMPLETE_SECTION"||next.state==="review"){
    await loadSummary(session.id);
   }
  }catch(e:any){setError("Response failed: "+e.message)}
  finally{setLoading(false)}
 };

 const speak=()=>{
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!SR){setError("Voice capture is unavailable in this browser. Please continue by typing.");return}
  const rec=new SR();
  rec.lang=language;rec.interimResults=true;rec.continuous=false;
  setListening(true);
  rec.onresult=(e:any)=>{
   let transcript="";
   for(let i=e.resultIndex;i<e.results.length;i++)transcript+=e.results[i][0].transcript;
   setText(transcript);
  };
  rec.onerror=()=>setError("Voice capture stopped unexpectedly. You can continue by typing.");
  rec.onend=()=>setListening(false);
  rec.start();
 };

 const saveProfile=async()=>{
  if(!patient)return;
  setLoading(true);setError("");
  try{
   const p=await request("/v1/abha/patients/"+patient.patientId+"/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile})});
   persist(p);setRecordStatus("Health profile saved to your patient workspace.");
  }catch(e:any){setError(e.message)}finally{setLoading(false)}
 };

 const upload=async(file:File)=>{
  if(!patient){setAfterLogin("records");setPage("login");return}
  setLoading(true);setError("");setRecordStatus("Uploading your original document…");
  try{
   const form=new FormData();form.append("file",file);
   const up=await request("/v1/resources/upload?patient_id="+encodeURIComponent(patient.patientId),{method:"POST",body:form});
   setRecord(up.resource);setRecordStatus("Reading the document and extracting health information…");
   const result=await request("/v1/resources/"+up.resource.resourceId+"/process",{method:"POST"});
   const saved={...up.resource,processing:result};setRecord(saved);
   const updated=await request("/v1/abha/patients/"+patient.patientId+"/records",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({resource_id:up.resource.resourceId,title:file.name,media_type:file.type,processing_status:result.status,evidence_count:result.evidence?.length||0})
   });
   persist(updated);
   setRecordStatus(result.status==="completed"?"Done — the record is now part of your patient workspace.":"Processing finished, but some information could not be extracted.");
  }catch(e:any){setError("Document processing failed: "+e.message);setRecordStatus("")}
  finally{setLoading(false)}
 };

 const nav=(p:Page)=>{if(p==="profile"||p==="records"||p==="abha")requirePatient(p);else setPage(p)};
 const complete=session?.nextAction?.type==="COMPLETE_SECTION"||session?.next_action?.type==="COMPLETE_SECTION"||session?.state==="review";
 const triage=session?.nextAction?.type==="TRIAGE_ALERT";
 const question=session?.nextAction?.patient_text||"Please describe what is troubling you today.";

 return <div className="app">
  <header>
   <button className="brand" onClick={()=>setPage("home")}>SETU <span>PRISM</span></button>
   <nav>
    {([["home","Home"],["profile","My Health"],["records","Records"],["abha","Health Space"]] as [Page,string][]).map(([p,label])=><button key={p} onClick={()=>nav(p)} className={page===p?"active":""}>{label}</button>)}
    <select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Language">
     <option value="en-IN">English</option><option value="ta-IN">தமிழ்</option><option value="hi-IN">हिन्दी</option>
    </select>
    {patient&&<button className="disconnect" onClick={()=>{localStorage.removeItem("setu_patient");setPatient(null);setProfile({conditions:"",medicines:"",allergies:""});setPage("home")}}>Disconnect</button>}
   </nav>
  </header>

  {error&&<div className="banner error"><span>{error}</span><button onClick={()=>setError("")}>×</button></div>}

  {page==="home"&&<main className="hero">
   <div className="heroCopy">
    <p className="eyebrow">PATIENT-FIRST PRE-CONSULTATION</p>
    <h1>Tell us what’s wrong.<br/><span>We’ll help organize the story.</span></h1>
    <p className="sub">PRISM turns a natural patient conversation into a structured pre-consultation case — before the doctor sees you.</p>
    {!patient&&<div className="notice">Your health workspace is created after mobile OTP consent. You remain in control of what you add.</div>}
    <div className="heroActions">
     <button className="primaryBtn large" onClick={start}>Start case-taking <span>→</span></button>
     <button className="quietBtn" onClick={()=>nav("records")}>Add an existing record</button>
    </div>
   </div>
   <div className="journey">
    <div><span>01</span><b>Tell your story</b><small>Speak, type, or choose answers naturally.</small></div>
    <div><span>02</span><b>PRISM asks what matters</b><small>The next question adapts to your concern.</small></div>
    <div><span>03</span><b>Review before sharing</b><small>See the organized case before it is saved.</small></div>
   </div>
  </main>}

  {page==="login"&&<main className="authPage">
   <div className="authCard">
    <p className="eyebrow">PATIENT IDENTITY & CONSENT</p>
    <div className="stepDots"><i className={!tx?"on":""}/><i className={tx?"on":""}/></div>
    <h2>{tx?"Enter the verification code":"Connect your health workspace"}</h2>
    <p className="muted">{tx?"We sent a one-time code to the mobile number you entered.":"Use your mobile number to establish a consented patient session for this demo."}</p>
    {!tx?<>
     <label className="fieldLabel">Mobile number</label>
     <input className="textInput" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+91 98765 43210" inputMode="tel"/>
     <button className="primaryBtn full" onClick={requestOtp} disabled={loading||mobile.replace(/\D/g,"").length<8}>{loading?"Sending code…":"Send verification code →"}</button>
    </>:<>
     <label className="fieldLabel">6-digit code</label>
     <input className="otpInput" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="••••••" inputMode="numeric" maxLength={6}/>
     {otpHint&&<div className="demoHint">Demo code: <b>{otpHint}</b></div>}
     <button className="primaryBtn full" onClick={verifyOtp} disabled={loading||otp.length!==6}>{loading?"Verifying…":"Verify & continue →"}</button>
     <button className="linkBtn" onClick={()=>{setTx("");setOtp("");setOtpHint("")}}>Use a different number</button>
    </>}
   </div>
  </main>}

  {page==="intake"&&<main className="intakeShell">
   <aside className="intakeRail">
    <div className="railBrand">PRISM <span>CASE-TAKING</span></div>
    <div className="railProgress"><span className="pulseDot"/><b>{complete?"Ready for review":"In conversation"}</b></div>
    <p>Answer naturally. You do not need to know medical terms.</p>
    {answers.length>0&&<div className="answeredCount">{answers.length} response{answers.length===1?"":"s"} captured</div>}
   </aside>
   <section className="conversation">
    <div className="conversationTop">
     <div><p className="eyebrow">PRE-CONSULTATION INTAKE</p><span className="modeLabel">You can speak, type, or tap</span></div>
     <button className="exitBtn" onClick={()=>setPage("home")}>Save & exit</button>
    </div>

    {!complete&&!triage&&answers.length>0&&<div className="conversationHistory">
     {answers.slice(-2).map((a,i)=><div key={i} className="historyBubble"><small>{a.question}</small><span>{a.answer}</span></div>)}
    </div>}

    {triage?<div className="triage">
      <b>⚠ Urgent attention may be needed</b>
      <p>This is not a diagnosis. Please seek immediate professional care or alert nearby staff.</p>
    </div>:complete?<div className="caseReview">
      <div className="reviewHead"><div><p className="eyebrow">REVIEW</p><h2>Your story, organized for consultation.</h2></div><span className="readyBadge">Ready</span></div>
      <p className="muted">Please review the information PRISM organized from your responses before saving it to your health workspace.</p>
      <SummaryView summary={summary}/>
    </div>:<>
      <div className="questionCard">
       <span className="prismAvatar">✦</span>
       <div><small>PRISM</small><h2>{question}</h2></div>
      </div>
      <div className="options">{session?.nextAction?.options?.map((o:any)=><button key={o.value} disabled={loading} onClick={()=>send(o.value,"touch")}>{o.label}<span>→</span></button>)}</div>
      <div className={"responseBox "+(listening?"isListening":"")}>
       <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="You can answer in your own words…"/>
       <div className="responseBar">
        <button className={"voice "+(listening?"live":"")} onClick={speak} disabled={loading}>{listening?"● Listening…":"🎙 Speak"}</button>
        <button className="primaryBtn" onClick={()=>send(text)} disabled={loading||!text.trim()}>{loading?"Thinking…":"Continue →"}</button>
       </div>
      </div>
      {listening&&<div className="listening">Listening now. Your words will appear in the response box.</div>}
    </>}

    {complete&&<div className="reviewActions">
     <button className="quietBtn" onClick={()=>setPage("home")}>Review later</button>
     <button className="primaryBtn" onClick={completeIssue} disabled={loading||savedIssue}>{loading?"Saving case…":"Confirm & prepare case →"}</button>
    </div>}
    <p className="safety">PRISM supports structured intake and information continuity. It does not diagnose or replace emergency care.</p>
   </section>
  </main>}

  {page==="profile"&&<main className="content">
   <p className="eyebrow">YOUR HEALTH CONTEXT</p><h2>My Health</h2>
   <p>Build your profile gradually. Patient-reported information stays distinct from hospital-sourced records.</p>
   <section className="profileGrid">{([["conditions","Known conditions","Conditions you already know about"],["medicines","Current medicines","Medicines you currently take"],["allergies","Allergies","Allergies or sensitivities you know about"]] as const).map(([key,label,help])=><label className="profileCard" key={key}><b>{label}</b><span>{help}</span><textarea value={profile[key]||""} onChange={e=>setProfile({...profile,[key]:e.target.value})} placeholder="Nothing added yet…"/></label>)}</section>
   <button className="primaryBtn" onClick={saveProfile} disabled={loading}>{loading?"Saving…":"Save health profile"}</button>
   <PatientContext patient={patient}/>
  </main>}

  {page==="records"&&<main className="content">
   <p className="eyebrow">YOUR MEDICAL DOCUMENTS</p><h2>Medical Records</h2>
   <p>Upload prescriptions, laboratory reports, discharge summaries, and diagnostic documents. The original source remains connected to extracted information.</p>
   <input ref={inputRef} type="file" accept=".pdf,image/*" hidden onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/>
   <button className="drop" onClick={()=>inputRef.current?.click()} disabled={loading}>
    <span className="uploadIcon">↑</span><b>{loading?"Working on your document…":"Choose a medical document"}</b>
    <small>PDF or image · OCR processing · source retained</small>
   </button>
   {recordStatus&&<div className="notice">{recordStatus}</div>}
   {record&&<RecordCard record={record}/>}
   <section className="readiness"><h3>Your records</h3><p>{patient?.records?.length||0} record(s) are currently linked to this patient workspace.</p></section>
  </main>}

  {page==="abha"&&<main className="content">
   <p className="eyebrow">YOUR PATIENT-SIDE HEALTH WORKSPACE</p><h2>{patient?.fullName||"My Health Space"}</h2>
   <p className="healthId">Health ID <b>{patient?.healthId}</b></p>
   <section className="dashboardGrid">
    <DashboardCard title="Current health issues" value={patient?.issues?.length||0} text="Captured through PRISM case-taking." action="Add new issue →" onClick={start}/>
    <DashboardCard title="Medical records" value={patient?.records?.length||0} text="Patient-uploaded documents and extracted evidence." action="Manage records →" onClick={()=>setPage("records")}/>
    <DashboardCard title="Health profile" value={[profile.conditions,profile.medicines,profile.allergies].filter(Boolean).length?"Updated":"Not started"} text="Conditions, medicines and allergies you report." action="Update profile →" onClick={()=>setPage("profile")}/>
   </section>
   <section className="readiness"><h3>What is connected here</h3>
    <div className="checklist"><div>✓ Patient-reported profile information</div><div>✓ PRISM text, touch, and voice intake</div><div>✓ Uploaded records with source provenance</div><div>✓ Shared patient context for the SETU demo continuity layer</div></div>
   </section>
  </main>}
 </div>;
}

function DashboardCard({title,value,text,action,onClick}:{title:string;value:any;text:string;action:string;onClick:()=>void}){
 return <div className="profileCard dashboardCard"><b>{title}</b><strong>{value}</strong><span>{text}</span><button onClick={onClick}>{action}</button></div>;
}

function PatientContext({patient}:{patient:any}){
 return <>
  <section className="readiness"><h3>Current health issues</h3>{patient?.issues?.length?<div className="evidenceList">{patient.issues.map((i:any)=><div key={i.id}><b>{i.title||"Health issue"}</b><span>{i.summary?.chief_complaint||i.description||"Patient-reported intake"}</span><small>{i.created_at||""}</small></div>)}</div>:<p>No current issues saved yet.</p>}</section>
  <section className="readiness"><h3>Linked medical records</h3>{patient?.records?.length?<div className="evidenceList">{patient.records.map((r:any)=><div key={r.id}><b>{r.title||"Medical record"}</b><span>{r.evidence_count||0} extracted evidence item(s)</span><small>{r.processing_status||"stored"}</small></div>)}</div>:<p>No records linked yet.</p>}</section>
 </>;
}

function SummaryView({summary}:{summary:any}){
 if(!summary)return <div className="notice">Preparing your consultation summary…</div>;
 const h=summary.history_of_present_illness||{},b=summary.medical_background||{};
 const entries=(obj:any)=>Object.entries(obj).filter(([,v])=>v&&String(v).trim());
 return <div className="summaryGrid">
  <section><b>Main concern</b><span>{summary.chief_complaint||"Not recorded"}</span></section>
  <section><b>Current problem</b><span>{entries(h).length?entries(h).map(([k,v])=><div key={k}><small>{k.replace(/_/g," ")}</small>{String(v)}</div>):"No additional details recorded"}</span></section>
  <section><b>Health background</b><span>{entries(b).length?entries(b).map(([k,v])=><div key={k}><small>{k.replace(/_/g," ")}</small>{String(v)}</div>):"No background details added"}</span></section>
  {summary.notice&&<div className="notice">{summary.notice}</div>}
 </div>;
}

function RecordCard({record}:{record:any}){
 const p=record.processing,ocr=p?.ocr;
 return <section className="recordCard">
  <div className="recordHead"><div><b>{record.originalFilename}</b><small>{record.mediaType} · Original source preserved</small></div>{p&&<span className="status">{p.status}</span>}</div>
  {ocr&&<><div className="metrics"><div><small>OCR ENGINE</small><b>{ocr.engine}</b></div><div><small>PAGES</small><b>{ocr.pages?.length||0}</b></div><div><small>EVIDENCE FOUND</small><b>{p.evidence?.length||0}</b></div></div>
  {p.evidence?.length>0&&<div className="evidenceList">{p.evidence.map((e:any,i:number)=><div key={i}><b>{e.category||e.kind}</b><span>{e.data?.value??e.value}</span><small>Source page {e.sourcePointers?.[0]?.page||e.page}</small></div>)}</div>}
  <details><summary>View extracted OCR text</summary><pre>{ocr.pages?.map((x:any)=>x.text||"No text returned for this page.").join("\n\n")||"No OCR text returned."}</pre></details></>}
 </section>;
}

createRoot(document.getElementById("root")!).render(<App/>);
