import type {
  ConversationInterpretation,
  ConversationModel
} from "./types.js";

const patterns: Record<string, RegExp[]> = {
  onset: [
    /\b(\d+\s*(day|days|week|weeks|month|months)|yesterday|today|last night|since)\b/i,
    /(\d+\s*(நாள்|நாட்கள்|வாரம்|வாரங்கள்|மாதம்|மாதங்கள்)|நேற்று|இன்று|முதல்)/i,
    /(\d+\s*(दिन|दिनों|हफ्ते|सप्ताह|महीने)|कल|आज|से)/i
  ],
  severity: [
    /\b(mild|moderate|severe|worst|unbearable|[1-9]|10)\b/i,
    /\b(லேசான|மிதமான|கடுமையான|தாங்க முடியாத)\b/i,
    /\b(हल्का|मध्यम|गंभीर|असहनीय)\b/i
  ],
  associated_symptoms: [
    /\b(and|also|along with|apart from)\b/i,
    /(மேலும்|அதோடு|கூட|தவிர)/i,
    /(और|साथ में|इसके अलावा)/i
  ],
  medications: [
    /\b(tablet|medicine|medication|dose|mg)\b/i,
    /(மாத்திரை|மருந்து|மி\.கி)/i,
    /(दवा|गोली|मिलीग्राम)/i
  ],
  allergies: [
    /\b(allergy|allergic)\b/i,
    /(ஒவ்வாமை)/i,
    /(एलर्जी)/i
  ],
  past_history: [
    /\b(diabetes|asthma|hypertension|surgery|operation)\b/i,
    /(சர்க்கரை நோய்|ஆஸ்துமா|உயர் ரத்த அழுத்தம்|அறுவை சிகிச்சை)/i,
    /(मधुमेह|अस्थमा|उच्च रक्तचाप|ऑपरेशन)/i
  ]
};

export class RuleConversationModel implements ConversationModel {
  async interpret(input: {
    text: string;
    expectedField?: string;
  }): Promise<ConversationInterpretation> {
    const text = input.text ?? "";
    const facts: ConversationInterpretation["facts"] = [];

    const addFact = (
      field: string,
      confidence: number
    ) => {
      facts.push({
        field,
        value: text.trim(),
        confidence,
        source: "patient_reported",
        evidence: text.trim()
      });
    };

    if (input.expectedField) {
      addFact(input.expectedField, 0.85);
    }

    for (const [field, expressions] of Object.entries(patterns)) {
      const alreadyPresent = facts.some((fact) => fact.field === field);
      if (!alreadyPresent && expressions.some((expression) => expression.test(text))) {
        addFact(field, 0.68);
      }
    }

    let intent: ConversationInterpretation["intent"] = "ANSWER";

    if (/upload|report|prescription|scan|பதிவேற்று|அறிக்கை|रिपोर्ट|अपलोड/i.test(text)) {
      intent = "RECORD_UPLOAD";
    } else if (/abha|health id|ஆபா|हेल्थ आईडी/i.test(text)) {
      intent = "ABHA_CONNECT";
    }

    return {
      intent,
      facts,
      confidence: facts.length > 0 ? 0.8 : 0.4,
      needsClarification: !text.trim()
    };
  }
}
