import type {Dosha,DoshaScores,PrakritiType} from "../../../../packages/clinical-schema/src/ayush.js";

export interface PrakritiQuestion{key:string;text:string;options:{label:string;value:string;dosha:Dosha}[]}

/**
 * Standard Ayurvedic Prakriti self-assessment: each question offers one
 * Vata-, Pitta-, and Kapha-characteristic answer. Tallying which dosha the
 * patient picks most often (normalized to a percentage) approximates their
 * innate constitution — the same method used in printed/clinic Prakriti
 * questionnaires, just structured as measurable data instead of a paper form.
 */
export const prakritiQuestions:PrakritiQuestion[]=[
 {key:"body_frame",text:"Which best describes your natural body frame?",options:[
  {label:"Thin, light, hard to gain weight",value:"thin_light",dosha:"vata"},
  {label:"Medium build, moderate muscle",value:"medium",dosha:"pitta"},
  {label:"Solid, heavier frame, gains weight easily",value:"solid_heavy",dosha:"kapha"}
 ]},
 {key:"skin",text:"How would you describe your skin?",options:[
  {label:"Dry, thin, cool to touch",value:"dry_thin",dosha:"vata"},
  {label:"Warm, soft, prone to rashes/sensitivity",value:"warm_sensitive",dosha:"pitta"},
  {label:"Thick, oily, smooth and cool",value:"thick_oily",dosha:"kapha"}
 ]},
 {key:"hair",text:"Which best describes your hair?",options:[
  {label:"Dry, thin, or frizzy",value:"dry_thin",dosha:"vata"},
  {label:"Fine, early thinning or greying",value:"fine_thinning",dosha:"pitta"},
  {label:"Thick, oily, wavy",value:"thick_oily",dosha:"kapha"}
 ]},
 {key:"appetite",text:"How would you describe your usual appetite?",options:[
  {label:"Variable — sometimes strong, sometimes forgets to eat",value:"variable",dosha:"vata"},
  {label:"Strong and sharp — gets irritable if a meal is delayed",value:"strong_sharp",dosha:"pitta"},
  {label:"Steady but can skip meals without much discomfort",value:"steady_low",dosha:"kapha"}
 ]},
 {key:"digestion",text:"How does your digestion typically feel after meals?",options:[
  {label:"Irregular — gas or bloating some days, fine others",value:"irregular",dosha:"vata"},
  {label:"Efficient, sometimes a burning sensation",value:"efficient_burning",dosha:"pitta"},
  {label:"Slow, a feeling of heaviness after eating",value:"slow_heavy",dosha:"kapha"}
 ]},
 {key:"sleep",text:"How would you describe your usual sleep?",options:[
  {label:"Light, interrupted, mind stays active",value:"light_interrupted",dosha:"vata"},
  {label:"Moderate, sound but can wake up warm",value:"moderate",dosha:"pitta"},
  {label:"Deep, long, hard to wake up",value:"deep_long",dosha:"kapha"}
 ]},
 {key:"temperament",text:"Under stress, you tend to become:",options:[
  {label:"Anxious or worried",value:"anxious",dosha:"vata"},
  {label:"Irritable or impatient",value:"irritable",dosha:"pitta"},
  {label:"Withdrawn or unmotivated",value:"withdrawn",dosha:"kapha"}
 ]},
 {key:"memory",text:"How would you describe your memory and learning style?",options:[
  {label:"Quick to learn, quick to forget",value:"quick_forget",dosha:"vata"},
  {label:"Sharp, clear, good at focused recall",value:"sharp_clear",dosha:"pitta"},
  {label:"Slower to learn, but retains for a long time",value:"slow_retain",dosha:"kapha"}
 ]},
 {key:"speech",text:"Which best describes your speech?",options:[
  {label:"Fast, talkative, jumps between topics",value:"fast_talkative",dosha:"vata"},
  {label:"Precise, sharp, persuasive",value:"precise_sharp",dosha:"pitta"},
  {label:"Slow, steady, thoughtful",value:"slow_steady",dosha:"kapha"}
 ]},
 {key:"joints",text:"How would you describe your joints?",options:[
  {label:"Prominent, sometimes crack or feel stiff",value:"prominent_stiff",dosha:"vata"},
  {label:"Flexible, moderate build",value:"flexible_moderate",dosha:"pitta"},
  {label:"Large, well-lubricated, sturdy",value:"large_sturdy",dosha:"kapha"}
 ]},
 {key:"climate_preference",text:"Which weather do you find least comfortable?",options:[
  {label:"Cold, dry, windy weather",value:"cold_dry_windy",dosha:"vata"},
  {label:"Hot weather",value:"hot",dosha:"pitta"},
  {label:"Cold, damp weather",value:"cold_damp",dosha:"kapha"}
 ]},
 {key:"physical_activity",text:"How would you describe your energy and activity level?",options:[
  {label:"Bursts of energy, tires quickly",value:"bursts_tires",dosha:"vata"},
  {label:"Moderate, driven, goal-focused",value:"moderate_driven",dosha:"pitta"},
  {label:"Steady stamina, slow to start moving",value:"steady_slow_start",dosha:"kapha"}
 ]}
];

/** Maps {question_key: selected_option_value} (what the client submits) to
 * {question_key: dosha} (what scorePrakriti needs), via the question bank. */
export function resolveDoshaAnswers(answers:Record<string,string>):Record<string,Dosha>{
 const resolved:Record<string,Dosha>={};
 for(const q of prakritiQuestions){
  const selected=answers[q.key];
  const option=q.options.find(o=>o.value===selected);
  if(option)resolved[q.key]=option.dosha;
 }
 return resolved;
}

export function scorePrakriti(answers:Record<string,Dosha>):{scores:DoshaScores;primary:PrakritiType}{
 const counts:DoshaScores={vata:0,pitta:0,kapha:0};
 for(const dosha of Object.values(answers)){
  if(dosha==="vata"||dosha==="pitta"||dosha==="kapha")counts[dosha]++;
 }
 const total=counts.vata+counts.pitta+counts.kapha||1;
 const scores:DoshaScores={
  vata:Math.round((counts.vata/total)*100),
  pitta:Math.round((counts.pitta/total)*100),
  kapha:Math.round((counts.kapha/total)*100)
 };
 const primary=classifyPrakriti(scores);
 return {scores,primary};
}

/** Dual-dosha when the top two are close (within 15 points of each other and
 * both meaningfully ahead of the third); Tridoshaja when all three are close;
 * otherwise single-dosha dominant. */
export function classifyPrakriti(scores:DoshaScores):PrakritiType{
 const ranked=(Object.entries(scores) as [Dosha,number][]).sort((a,b)=>b[1]-a[1]);
 const [first,second,third]=ranked;
 if(first[1]-third[1]<=15)return "tridoshaja";
 if(first[1]-second[1]<=15){
  const pair=[first[0],second[0]].sort().join("_");
  if(pair==="pitta_vata")return "vata_pitta";
  if(pair==="kapha_pitta")return "pitta_kapha";
  if(pair==="kapha_vata")return "vata_kapha";
 }
 return first[0];
}
