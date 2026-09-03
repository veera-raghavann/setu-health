export type InputMode="text"|"touch"|"voice";
export interface ConversationTurn{role:"patient"|"system";value:string;inputMode:InputMode;language:string;at:string}
export interface NextQuestion{key:string;text:string;options?:string[];required:boolean;reason:string}
export interface ConversationDecision{state:string;language:string;nextAction:{type:string;patient_text:string;input_mode:"BOTH"|"NONE";options:{label:string;value:string}[]};safety?:{level:string;reason:string;action:string};missing:string[]}