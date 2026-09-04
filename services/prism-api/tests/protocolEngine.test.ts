import test from "node:test"; import assert from "node:assert/strict";
import {questionsFor,conditions} from "../src/protocolEngine.js";
import type {IntakeSession} from "../src/types.js";

function session(condition?:string):IntakeSession{
 return {id:"s1",patientId:null,language:"en-IN",entryPoint:"current_health_issue",state:"active",pathway:"unknown",clinicalContext:condition?{condition}:{},nextAction:{},createdAt:"",updatedAt:""};
}

test("every condition branch resolves its own defined question keys in order",()=>{
 for(const key of Object.keys(conditions)){
  const qs=questionsFor(session(key));
  const expectedKeys=(conditions as any)[key].questions.map((q:any)=>q.key);
  assert.deepEqual(qs.map(q=>q.key),expectedKeys);
 }
});

test("a session with no condition set defaults to the 'other' generic flow",()=>{
 const qs=questionsFor(session());
 assert.deepEqual(qs.map(q=>q.key),conditions.other.questions.map(q=>q.key));
});

test("an unrecognized condition value also falls back to 'other'",()=>{
 const qs=questionsFor(session("not_a_real_condition"));
 assert.deepEqual(qs.map(q=>q.key),conditions.other.questions.map(q=>q.key));
});

test("already-answered questions are filtered out of the remaining list",()=>{
 const s=session("fever");
 (s.clinicalContext as any).answers=[{key:"onset",value:"today"}];
 const qs=questionsFor(s);
 assert.ok(!qs.some(q=>q.key==="onset"));
 assert.equal(qs[0].key,"pattern");
});

test("every condition ends with the shared severity question",()=>{
 for(const key of Object.keys(conditions)){
  const qs=(conditions as any)[key].questions;
  assert.equal(qs[qs.length-1].key,"severity");
 }
});
