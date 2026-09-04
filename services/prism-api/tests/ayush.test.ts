import test from "node:test"; import assert from "node:assert/strict";
import {resolveDoshaAnswers,scorePrakriti,classifyPrakriti,prakritiQuestions} from "../src/ayush/prakritiQuestionnaire.js";
import {scoreAgni,scoreKoshtha,agniQuestions} from "../src/ayush/agniKosthaQuestionnaire.js";
import {checkPrakritiAgniCorrelation} from "../src/ayush/correlationRules.js";

test("resolveDoshaAnswers maps submitted option values back to their dosha via the question bank",()=>{
 const answers=resolveDoshaAnswers({body_frame:"thin_light",skin:"warm_sensitive",hair:"nonexistent_value"});
 assert.equal(answers.body_frame,"vata");
 assert.equal(answers.skin,"pitta");
 assert.equal(answers.hair,undefined);
});

test("scorePrakriti gives 100% to a dosha answered on every question",()=>{
 const allVata:Record<string,"vata"> = {};
 for(const q of prakritiQuestions)allVata[q.key]="vata";
 const {scores,primary}=scorePrakriti(allVata);
 assert.equal(scores.vata,100);
 assert.equal(primary,"vata");
});

test("classifyPrakriti detects a close dual-dosha pair",()=>{
 assert.equal(classifyPrakriti({vata:45,pitta:40,kapha:15}),"vata_pitta");
 assert.equal(classifyPrakriti({vata:10,pitta:45,kapha:45}),"pitta_kapha");
});

test("classifyPrakriti falls back to tridoshaja when all three are close",()=>{
 assert.equal(classifyPrakriti({vata:34,pitta:33,kapha:33}),"tridoshaja");
});

test("classifyPrakriti picks a single dominant dosha when clearly ahead",()=>{
 assert.equal(classifyPrakriti({vata:70,pitta:20,kapha:10}),"vata");
});

test("scoreAgni tallies mapped answers and returns the most frequent Agni type",()=>{
 assert.equal(scoreAgni(["strong","strong","irregular"]),"tikshagni");
 assert.equal(scoreAgni(["steady","steady","weak"]),"samagni");
});

test("scoreAgni defaults sensibly on no recognizable answers",()=>{
 assert.equal(scoreAgni([]),"samagni");
});

test("scoreKoshtha only accepts the two named values, else defaults to madhyama",()=>{
 assert.equal(scoreKoshtha("krura"),"krura");
 assert.equal(scoreKoshtha("mridu"),"mridu");
 assert.equal(scoreKoshtha("something_else"),"madhyama");
});

test("checkPrakritiAgniCorrelation is silent when Agni matches the dominant dosha's expected baseline",()=>{
 const alerts=checkPrakritiAgniCorrelation({vata:10,pitta:80,kapha:10},"tikshagni");
 assert.equal(alerts.length,0);
});

test("checkPrakritiAgniCorrelation is silent for samagni regardless of dosha (balanced fire is never itself alarming)",()=>{
 const alerts=checkPrakritiAgniCorrelation({vata:80,pitta:10,kapha:10},"samagni");
 assert.equal(alerts.length,0);
});

test("checkPrakritiAgniCorrelation flags a Pitta-dominant patient presenting with Mandagni",()=>{
 const alerts=checkPrakritiAgniCorrelation({vata:10,pitta:75,kapha:15},"mandagni");
 assert.equal(alerts.length,1);
 assert.equal(alerts[0].severity,"warning");
 assert.match(alerts[0].message,/pitta-dominant/i);
 assert.match(alerts[0].message,/mandagni/);
});

test("every Agni question offers exactly four options mapping to the four Agni types",()=>{
 for(const q of agniQuestions)assert.equal(q.options.length,4);
});

test("every Prakriti question offers exactly one option per dosha",()=>{
 for(const q of prakritiQuestions){
  const doshas=q.options.map(o=>o.dosha).sort();
  assert.deepEqual(doshas,["kapha","pitta","vata"]);
 }
});
