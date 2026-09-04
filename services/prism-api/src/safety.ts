export interface SafetyFlag{level:"emergency"|"urgent"|"none";reason:string;action:string}
const emergency=[
/(chest pain|pressure in chest).*(breath|sweat|faint)|(stroke|face droop|slurred speech)|unconscious|severe bleeding/i,
/(மார்பு வலி|மார்பில் அழுத்தம்).*(மூச்சு|வியர்வை|மயக்கம்)|பக்கவாதம்|முகம்.*வளை|பேச்சு.*குழற|நினைவிழ|கடுமையான இரத்தப்போக்கு/i,
/(सीने में दर्द|छाती में दबाव).*(सांस|पसीना|बेहोश)|स्ट्रोक|चेहरा.*टेढ़|बोलने में.*दिक्कत|बेहोश|भारी रक्तस्राव/i];
const urgent=[/high fever.*(confusion|breath)|severe pain|suicid/i,/காய்ச்சல்.*(குழப்ப|மூச்சு)|தாங்க முடியாத வலி|தற்கொலை/i,/तेज बुखार.*(भ्रम|सांस)|असहनीय दर्द|आत्महत्या/i];
export function screenRedFlags(text:string):SafetyFlag{if(emergency.some(r=>r.test(text)))return{level:"emergency",reason:"Possible time-critical symptom pattern",action:"Route for immediate human triage; do not continue routine intake."};if(urgent.some(r=>r.test(text)))return{level:"urgent",reason:"Potentially serious symptom pattern",action:"Prompt rapid staff review."};return{level:"none",reason:"No rule-based red flag detected",action:"Continue structured intake."}}