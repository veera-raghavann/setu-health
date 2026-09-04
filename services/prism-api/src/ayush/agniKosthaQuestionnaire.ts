import type {AgniType,KosthaType} from "../../../../packages/clinical-schema/src/ayush.js";

export interface SimpleQuestion{key:string;text:string;options:{label:string;value:string}[]}

/** Agni self-assessment: three short questions map onto the four classical
 * Agni states rather than asking the patient to self-diagnose directly. */
export const agniQuestions:SimpleQuestion[]=[
 {key:"appetite_regularity",text:"How regular is your appetite day to day?",options:[
  {label:"Unpredictable — strong some days, absent others",value:"irregular"},
  {label:"Very strong and sharp, rarely varies",value:"strong"},
  {label:"Weak most days, easy to feel full",value:"weak"},
  {label:"Steady and comfortable most days",value:"steady"}
 ]},
 {key:"post_meal_comfort",text:"How do you usually feel 1-2 hours after a meal?",options:[
  {label:"Gassy or bloated, varies a lot",value:"irregular"},
  {label:"Fine, sometimes acidity or a burning feeling",value:"strong"},
  {label:"Heavy, sluggish, or drowsy",value:"weak"},
  {label:"Comfortable and light",value:"steady"}
 ]},
 {key:"food_tolerance",text:"How well do you tolerate a delayed or skipped meal?",options:[
  {label:"Poorly — get shaky, spacey, or anxious",value:"irregular"},
  {label:"Poorly — get irritable or unwell quickly",value:"strong"},
  {label:"Very easily, barely notice",value:"weak"},
  {label:"Reasonably well",value:"steady"}
 ]}
];

const agniTally:Record<string,AgniType>={irregular:"vishamagni",strong:"tikshagni",weak:"mandagni",steady:"samagni"};

export function scoreAgni(answers:string[]):AgniType{
 const counts:Record<AgniType,number>={samagni:0,vishamagni:0,tikshagni:0,mandagni:0};
 for(const a of answers){const type=agniTally[a];if(type)counts[type]++}
 return (Object.entries(counts) as [AgniType,number][]).sort((a,b)=>b[1]-a[1])[0][0];
}

export const kosthaQuestion:SimpleQuestion={key:"bowel_tendency",text:"Which best describes your natural bowel tendency?",options:[
 {label:"Tends to be hard, dry, or constipated",value:"krura"},
 {label:"Tends to be soft, loose, or urgent",value:"mridu"},
 {label:"Regular and well-formed most days",value:"madhyama"}
]};

export function scoreKoshtha(value:string):KosthaType{
 return value==="krura"||value==="mridu"?value:"madhyama";
}
