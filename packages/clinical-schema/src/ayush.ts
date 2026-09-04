/**
 * Ayurvedic (AYUSH) case-taking data model. Maps the foundational pillars of
 * Ayurvedic diagnostic theory into measurable, structured fields — kept
 * distinct from (but linkable to) the allopathic evidence model in
 * evidence.ts, since a patient may follow either or both pathways.
 *
 * Split by who can legitimately produce the data:
 *  - Prakriti, Agni, Koshtha, Mala: patient-self-reportable via a structured
 *    questionnaire (subjective constitution/lifestyle/elimination patterns).
 *  - Vikriti, Dhatu, Trividha Pariksha, Ashtavidha Pariksha: require a
 *    practitioner's physical examination (pulse, tongue, palpation, etc.) —
 *    clinician-entered only, never inferred from a patient questionnaire.
 */

export type Dosha="vata"|"pitta"|"kapha";

/** Prakriti: permanent constitution established at birth. Single or dual-dosha
 * dominant, or Tridoshaja when all three are closely balanced. */
export type PrakritiType="vata"|"pitta"|"kapha"|"vata_pitta"|"pitta_kapha"|"vata_kapha"|"tridoshaja";

/** Agni: metabolic/digestive fire. */
export type AgniType="samagni"|"vishamagni"|"tikshagni"|"mandagni";

/** Koshtha: bowel tendency, relevant to purgation/Panchakarma planning. */
export type KosthaType="mridu"|"krura"|"madhyama";

export interface DoshaScores{vata:number;pitta:number;kapha:number}

export interface PrakritiAssessment{
 primary:PrakritiType;
 scores:DoshaScores; // percentages, sum to ~100
 source:"patient_questionnaire"|"clinician_assessed";
 assessedAt:string;
}

export interface AgniAssessment{
 type:AgniType;
 source:"patient_questionnaire"|"clinician_assessed";
 assessedAt:string;
}

export interface KosthaAssessment{
 type:KosthaType;
 source:"patient_questionnaire"|"clinician_assessed";
 assessedAt:string;
}

/** Vikriti: current pathological imbalance — a clinical judgment, not
 * self-reportable. Target healing path = Vikriti compared against Prakriti. */
export interface VikritiAssessment{
 vataVitiation:boolean;
 pittaVitiation:boolean;
 kaphaVitiation:boolean;
 notes?:string;
 assessedBy:"clinician";
 assessedAt:string;
}

/** Mala: excreta / elimination efficiency — patient can reasonably self-report. */
export interface MalaAssessment{
 purisha?:"normal"|"hard"|"loose"; // feces
 mutra?:"normal"|"scanty"|"excessive"; // urine
 sweda?:"normal"|"deficient"|"profuse"; // sweat
 source:"patient_questionnaire"|"clinician_assessed";
 assessedAt:string;
}

export type DhatuSeverity=0|1|2|3; // 0 = not involved, 1-3 = increasing severity

/** Dhatu: tissue-level depth of disease — clinical judgment only. */
export interface DhatuAssessment{
 rasa?:DhatuSeverity; // plasma
 rakta?:DhatuSeverity; // blood
 mamsa?:DhatuSeverity; // muscle
 meda?:DhatuSeverity; // fat
 asthi?:DhatuSeverity; // bone
 majja?:DhatuSeverity; // nerve/marrow
 shukra?:DhatuSeverity; // reproductive
 assessedBy:"clinician";
 assessedAt:string;
}

/** Trividha Pariksha: threefold examination. Darshana/Sparshana require a
 * practitioner present with the patient; Prashna overlaps with PRISM's
 * existing free-text intake but is captured here too for AYUSH-pathway notes. */
export interface TrividhaPariksha{
 darshana?:string; // visual inspection findings
 sparshana?:string; // palpation findings
 prashna?:string; // interrogation/history notes specific to the AYUSH exam
 assessedBy:"clinician";
 assessedAt:string;
}

/** Ashtavidha Pariksha: eight-fold clinical examination grid. */
export interface AshtavidhaPariksha{
 nadi?:string; // pulse
 mutra?:string; // urine (exam finding)
 mala?:string; // stool (exam finding)
 jihva?:string; // tongue
 shabda?:string; // voice
 sparsha?:string; // skin/touch
 drik?:string; // eyes
 akruti?:string; // overall build
 assessedBy:"clinician";
 assessedAt:string;
}

export interface AyushAlert{
 type:string;
 severity:"info"|"warning";
 message:string;
 generatedAt:string;
}

export interface AyurvedicAssessment{
 id:string;
 patientId:string;
 prakriti?:PrakritiAssessment;
 agni?:AgniAssessment;
 koshtha?:KosthaAssessment;
 mala?:MalaAssessment;
 vikriti?:VikritiAssessment;
 dhatu?:DhatuAssessment;
 trividhaPariksha?:TrividhaPariksha;
 ashtavidhaPariksha?:AshtavidhaPariksha;
 alerts:AyushAlert[];
 createdAt:string;
 updatedAt:string;
}

/** Expected Agni per dominant Prakriti dosha, per classical correlation —
 * a Pitta-dominant patient presenting with Mandagni (Kapha-pattern fire) is a
 * significant deviation from their own baseline, not just "low digestion". */
export const EXPECTED_AGNI_BY_DOSHA:Record<Dosha,AgniType>={vata:"vishamagni",pitta:"tikshagni",kapha:"mandagni"};

export function dominantDosha(scores:DoshaScores):Dosha{
 return (Object.entries(scores) as [Dosha,number][]).sort((a,b)=>b[1]-a[1])[0][0];
}
