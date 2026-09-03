import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {BhashiniStreamingClient} from "./lib/bhashiniStreaming";
import "./styles.css";

type Page="home"|"intake"|"profile"|"records"|"abha";
type SpeechRecognitionLike={start:()=>void;stop:()=>void;lang:string;continuous:boolean;interimResults:boolean;onresult:any;onerror:any;onend:any};
const API=import.meta.env.VITE_PRISM_API_URL||"http://localhost:8000";
const BHASHINI_KEY=import.meta.env.VITE_BHASHINI_API_KEY||"";
const patientId=localStorage.getItem("prism_patient_id")||crypto.randomUUID();
localStorage.setItem("prism_patient_id",patientId);
const langName=(l:string)=>l.startsWith("ta")?"Tamil":l.startsWith("hi")?"Hindi":"English";
const browserSpeechAvailable=()=>typeof window!=="undefined"&&!!((window as any).SpeechRecognition||(window as any).webkitSpeechRecognition);

function App(){
 const [page,setPage]=useState<Page>("home"),[session,setSession]=useState<any>(null),[text,setText]=useState(""),[loading,setLoading]=useState(false),[language,setLanguage]=useState("en-IN"),[recording,setRecording]=useState(false),[interim,setInterim]=useState(""),[notice,setNotice]=useState(""),[records,setRecords]=useState<any[]>([]),[voiceProvider,setVoiceProvider]=useState(BHASHINI_KEY?"BHASHINI":"Browser fallback"),[ocrStatus,setOcrStatus]=useState(""),[ocrResults,setOcrResults]=useState<Record<string,any>>({}),[expandedRecord,setExpandedRecord]=useState<string|null>(null);
 const bhashiniVoice=useRef<BhashiniStreamingClient|null>(null);
 const browserVoice=useRef<SpeechRecognitionLike|null>(null);
 const question=session?.nextAction?.patient_text||session?.next_action?.patient_text||"Please describe what is troubling you today.";
 const options=session?.nextAction?.options||session?.next_action?.options||[];

 const loadRecords=async()=>{try{const r=await fetch(API+"/v1/patients/"+encodeURIComponent(patientId)+"/resources");if(r.ok)setRecords(await r.json())}catch{}};
 useEffect(()=>()=>{bhashiniVoice.current?.stop();browserVoice.current?.stop()},[]);
 useEffect(()=>{if(page==="records")loadRecords()},[page]);
 useEffect(()=>{if(page==="intake"&&session&&"speechSynthesis" in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(question);u.lang=language;u.rate=.95;window.speechSynthesis.speak(u)}},[session,question,page,language]);

 const start=async()=>{setLoading(true);setNotice("");try{
   const r=await fetch(API+"/v1/intake/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({patient_id:patientId,language,entry_point:"current_health_issue",pathway:"guided_case_taking"})});
   const s=await r.json();if(!r.ok)throw new Error(s.error||"Unable to start case-taking.");setSession(s);setPage("intake");
 }catch(e:any){setNotice(e.message||"Unable to start PRISM. Check the API connection.")}finally{setLoading(false)}};

 const send=async(value:string,mode="text")=>{if(!session||!value.trim())return;setLoading(true);setNotice("");try{
   const r=await fetch(API+"/v1/intake/sessions/"+session.id+"/responses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value,input_mode:mode})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to continue intake.");setSession(data);setText("");
   const action=data?.nextAction?.type||data?.next_action?.type;
   if(action==="OPEN_RECORD_UPLOAD")setPage("records");if(action==="OPEN_ABHA_CONNECT")setPage("abha");
 }catch(e:any){setNotice(e.message)}finally{setLoading(false)}};

 const startBrowserVoice=()=>{
   const C=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
   if(!C){setNotice("Voice recognition is not supported by this browser. Use Chrome for the demo.");return}
   const rec:any=new C();rec.lang=language;rec.continuous=false;rec.interimResults=true;
   rec.onresult=(event:any)=>{let finalText="";let live="";for(let i=event.resultIndex;i<event.results.length;i++){const t=event.results[i][0].transcript;if(event.results[i].isFinal)finalText+=t;else live+=t}setInterim(live);if(finalText.trim()){setText(finalText.trim());setNotice("Voice captured. Review it or press Continue.");setInterim("")}};
   rec.onerror=(e:any)=>{setRecording(false);if(e.error!=="no-speech")setNotice("Voice input error: "+e.error)};
   rec.onend=()=>setRecording(false);browserVoice.current=rec;rec.start();setRecording(true);setVoiceProvider("Browser fallback");
 };

 const toggleVoice=async()=>{
   if(recording){bhashiniVoice.current?.stop();browserVoice.current?.stop();setRecording(false);return}
   if(BHASHINI_KEY){try{
     const client=new BhashiniStreamingClient(BHASHINI_KEY,langName(language),{onInterim:t=>setInterim(t),onFinal:(t)=>{setInterim("");if(t.trim()){setText(t);setNotice("BHASHINI captured your speech. Press Continue to proceed.")}},onStatus:s=>setRecording(s==="starting"||s==="streaming"),onError:e=>{setNotice("BHASHINI unavailable. Switching to browser voice.");setRecording(false);startBrowserVoice()}});
     bhashiniVoice.current=client;setVoiceProvider("BHASHINI");await client.start();return;
   }catch{startBrowserVoice();return}}
   startBrowserVoice();
 };

 const upload=async(file:File)=>{setLoading(true);setOcrStatus("Saving original resource…");setNotice("");try{
   const fd=new FormData();fd.append("file",file);
   const r=await fetch(API+"/v1/resources/upload?patient_id="+encodeURIComponent(patientId),{method:"POST",body:fd});const data=await r.json();
   if(!r.ok)throw new Error(data.error||"Upload failed");setOcrStatus("Running multilingual OCR and evidence extraction…");
   const processed=await fetch(API+"/v1/resources/"+data.resource.resourceId+"/process?language_hint="+encodeURIComponent(language),{method:"POST"});
   if(!processed.ok)throw new Error("Original record was saved, but OCR processing failed.");
   const result=await processed.json();setOcrResults(prev=>({...prev,[data.resource.resourceId]:result}));setExpandedRecord(data.resource.resourceId);const count=Array.isArray(result.evidence)?result.evidence.length:0;setOcrStatus(`Completed. ${count} evidence item${count===1?"":"s"} extracted with provenance linked to the original source.`);setNotice("OCR completed. Open the extraction panel below to inspect extracted content and source links.");await loadRecords();
 }catch(e:any){setOcrStatus("");setNotice(e.message)}finally{setLoading(false)}};

 const inspectRecord=async(id:string)=>{setLoading(true);setNotice("");try{const r=await fetch(API+"/v1/resources/"+id+"/process?language_hint="+encodeURIComponent(language),{method:"POST"});const data=await r.json();if(!r.ok)throw new Error(data.error||"OCR processing failed");setOcrResults(prev=>({...prev,[id]:data}));setExpandedRecord(id)}catch(e:any){setNotice(e.message||"Unable to inspect OCR output")}finally{setLoading(false)}};

 const speakQuestion=()=>{if("speechSynthesis" in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(question);u.lang=language;window.speechSynthesis.speak(u)}};

 return <div className="app">
  <header><button className="brand" onClick={()=>setPage("home")}>SETU <span>PRISM</span></button><nav>{([["home","Home"],["profile","My Health"],["records","Records"],["abha","ABHA"]] as [Page,string][]).map(([p,label])=><button key={p} onClick={()=>setPage(p)} className={page===p?"active":""}>{label}</button>)}<select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Language"><option value="en-IN">English</option><option value="ta-IN">தமிழ்</option><option value="hi-IN">हिन्दी</option></select></nav></header>
  {notice&&<div className="notice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
  {page==="home"&&<main className="hero"><div className="heroBadge">MULTILINGUAL DIGITAL HEALTH · HACKATHON DEMO</div><p className="eyebrow">PATIENT HEALTH WORKSPACE</p><h1>One place for your health journey.<br/><span>Start with what matters now.</span></h1><p className="sub">SETU combines adaptive patient case-taking, multilingual interaction and source-aware medical record digitisation into one patient-first experience.</p><div className="grid"><button className="card primary" onClick={start} disabled={loading}><b>🩺 I have a health concern</b><span>Describe what is troubling you. PRISM asks the next relevant question.</span><em>Start case-taking →</em></button><button className="card" onClick={()=>setPage("records")}><b>📄 Add previous medical records</b><span>Upload reports and prescriptions. Keep originals linked to extracted information.</span><em>Open records →</em></button><button className="card" onClick={()=>setPage("profile")}><b>❤️ Build my health profile</b><span>Progressively collect allergies, medicines and health history.</span><em>Explore profile →</em></button><button className="card" onClick={()=>setPage("abha")}><b>🏥 Connect ABHA</b><span>Prepare for consented digital-health information exchange.</span><em>View readiness →</em></button></div><div className="demoStrip"><span>✓ Adaptive questions</span><span>✓ English · தமிழ் · हिन्दी</span><span>✓ Voice + text + touch</span><span>✓ OCR with provenance</span></div></main>}
  {page==="intake"&&<main className="intake"><div className="intakeTop"><div><p className="eyebrow">CURRENT HEALTH ISSUE</p><span className="languageChip">{langName(language)} · {voiceProvider}</span></div><button className="listenBtn" onClick={speakQuestion}>🔊 Hear question</button></div><div className="questionCard"><div className="aiDot">✦</div><h2>{question}</h2><p className="muted">Answer naturally. PRISM updates the case state and chooses the next question.</p></div>
   {options.length>0&&<div className="options">{options.map((o:any)=><button key={o.value||o} onClick={()=>send(o.value||o,"touch")} disabled={loading}>{o.label||o}</button>)}</div>}
   <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={language.startsWith("ta")?"உங்கள் பிரச்சினையை விவரிக்கவும்…":language.startsWith("hi")?"अपनी समस्या बताइए…":"Describe in your own words…"} />
   <div className="row"><button className={"voice "+(recording?"recording":"")} onClick={toggleVoice} disabled={loading}>{recording?"● Listening… tap to stop":"🎙 Speak"}</button><button className="primaryBtn" onClick={()=>send(text,"text")} disabled={loading||!text.trim()}>Continue →</button></div>
   <div className="voiceStatus">{recording?"Listening in "+langName(language)+(interim?" · "+interim:""):browserSpeechAvailable()||BHASHINI_KEY?"Voice ready · Bhashini adapter activates when approved":"Use text input in this browser"}</div>
   <p className="safety">PRISM supports structured patient intake and information continuity. It does not diagnose, prescribe treatment or replace emergency care.</p></main>}
  {page==="profile"&&<main className="content"><p className="eyebrow">PROGRESSIVE HEALTH PROFILE</p><h2>My Health</h2><p>SETU does not force patients to complete a long form before receiving help. Health context can grow over time.</p><section className="featureGrid"><div><h3>Known conditions</h3><p>Patient-reported and clinically sourced information remain distinguishable.</p></div><div><h3>Current medicines</h3><p>Track medicines with source and confidence metadata.</p></div><div><h3>Allergies</h3><p>Capture patient-reported information without claiming clinical verification.</p></div></section></main>}
  {page==="records"&&<main className="content"><p className="eyebrow">SOURCE-AWARE HEALTH RECORDS</p><h2>Medical Records</h2><p>Upload prescriptions, laboratory reports, discharge summaries and diagnostic documents. SETU preserves the original resource and links extracted evidence back to it.</p><label className="drop"><input type="file" accept=".pdf,image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/><strong>Upload a medical document</strong><br/><small>PDF and image resources · multilingual OCR · provenance-aware extraction</small></label>{(loading||ocrStatus)&&<div className="processing">{ocrStatus||"Working on your request…"}</div>}
   <div className="recordList">{records.length===0?<div className="emptyState">No records yet. Upload a document to demonstrate the OCR pipeline.</div>:records.map(r=>{const result=ocrResults[r.resourceId];const expanded=expandedRecord===r.resourceId;const evidence=result?.evidence||[];const rawText=(result?.ocr?.pages||[]).map((p:any)=>`Page ${p.page}\n${p.text}`).join("\n\n");return <div className="recordWrap" key={r.resourceId}><div className="record"><div><b>{r.originalFilename}</b><small>{r.mediaType} · Original source preserved · {new Date(r.createdAt).toLocaleString()}</small></div><div className="recordActions"><button onClick={()=>result?setExpandedRecord(expanded?null:r.resourceId):inspectRecord(r.resourceId)}>{result?(expanded?"Hide extraction":"View extraction"):"Run OCR & inspect"}</button><a href={API+"/v1/resources/"+r.resourceId+"/download"} target="_blank" rel="noreferrer">Open source ↗</a></div></div>{expanded&&result&&<div className="ocrPanel"><div className="ocrSummary"><div><span>OCR ENGINE</span><b>{result.ocr?.engine||"Unknown"}</b></div><div><span>LANGUAGES</span><b>{(result.ocr?.languageHints||[]).join(", ")||"Auto"}</b></div><div><span>PAGES</span><b>{result.ocr?.pages?.length||0}</b></div><div><span>EVIDENCE FOUND</span><b>{evidence.length}</b></div></div><div className="provenanceNote">✓ Every extracted item remains linked to <b>{r.originalFilename}</b> with page, source text and OCR confidence.</div>{evidence.length>0?<div className="evidenceList">{evidence.map((e:any)=><div className="evidenceItem" key={e.id}><div><span className="evidenceKind">{String(e.category||e.kind||"evidence").replace(/_/g," ")}</span><b>{String(e.data?.value??e.value??"Extracted value")}{e.data?.unit||e.unit?` ${e.data?.unit||e.unit}`:""}</b><p>{e.sourcePointers?.[0]?.sourceText||e.sourceText}</p></div><small>Page {e.sourcePointers?.[0]?.page||e.page||1} · Confidence {e.sourcePointers?.[0]?.confidence??e.confidence??"N/A"}</small></div>)}</div>:<div className="noEvidence">OCR completed, but no structured evidence matched the current extraction rules. The raw OCR text is still available below.</div>}<details className="rawOcr"><summary>View raw OCR text</summary><pre>{rawText||"No text returned by the OCR worker."}</pre></details></div>}</div>}))}</div></main>}
  {page==="abha"&&<main className="content"><p className="eyebrow">DIGITAL HEALTH CONNECTIVITY</p><h2>ABHA & ABDM Readiness</h2><p>External health information will be connected only through approved ABDM pathways and explicit patient consent.</p><div className="placeholder"><b>Data origin remains visible</b><br/><br/>ABHA-verified information · Healthcare-provider records · Patient-uploaded records · Patient-reported information<br/><br/>SETU keeps these categories distinct instead of treating every data point as equally verified.</div></main>}
 </div>
}
createRoot(document.getElementById("root")!).render(<App/>);