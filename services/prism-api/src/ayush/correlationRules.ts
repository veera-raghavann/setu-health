import type {AyushAlert,DoshaScores,AgniType} from "../../../../packages/clinical-schema/src/ayush.js";
import {EXPECTED_AGNI_BY_DOSHA,dominantDosha} from "../../../../packages/clinical-schema/src/ayush.js";

/**
 * A patient's Prakriti corresponds to an expected baseline Agni (e.g. Pitta
 * Prakriti -> Tikshagni). When the patient's current self-reported Agni
 * departs from that baseline, it signals a current imbalance worth a
 * clinician's attention — this is exactly the automatic Vikriti-direction
 * flag classical Ayurvedic reasoning uses Prakriti-Agni correlation for.
 */
export function checkPrakritiAgniCorrelation(scores:DoshaScores,currentAgni:AgniType):AyushAlert[]{
 const dominant=dominantDosha(scores);
 const expected=EXPECTED_AGNI_BY_DOSHA[dominant];
 if(currentAgni===expected||currentAgni==="samagni")return [];
 return [{
  type:"prakriti_agni_deviation",
  severity:"warning",
  message:`This patient's constitution is ${dominant}-dominant, which typically presents as ${expected}. They currently report ${currentAgni} instead — a notable deviation from baseline that may indicate an active imbalance (Vikriti) requiring clinical review.`,
  generatedAt:new Date().toISOString()
 }];
}
