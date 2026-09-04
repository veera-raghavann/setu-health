/**
 * Static UI chrome strings (nav, buttons, safety disclaimer) — hand-populated once,
 * not translated live. Dynamic clinical text (questions, condition labels, patient
 * answers) is translated server-side per session via the translation adapter instead;
 * this file exists so a translation-API hiccup can never garble a safety-critical
 * string like the intake disclaimer.
 *
 * Only English, Hindi, and Tamil are fully populated for now (the languages this
 * project has actively demoed). Every other language in the dropdown still gets
 * fully-translated clinical Q&A from the server — it just falls back to English
 * for this static chrome until a teammate fills in more rows here.
 */
export const strings:Record<string,Record<string,string>>={
 "en-IN":{
  nav_home:"Home",nav_my_health:"My Health",nav_records:"Records",nav_abha:"ABHA",nav_disconnect:"Disconnect",
  safety_line:"PRISM supports structured intake and information continuity. It does not diagnose or replace emergency care.",
  speak:"🎙 Speak",stop_recording:"⏹ Stop recording",transcribing:"Transcribing…",speak_question:"🔊 Speak question",upload_instead:"📎 Upload a photo instead",
  continue_btn:"Continue →",working:"Working…",finish_save:"Finish & save →",saving:"Saving…",
  send_otp:"Send OTP →",sending:"Sending…",verify_continue:"Verify & continue →",verifying:"Verifying…",
  or_describe_own_words:"or describe it in your own words",
  mobile_placeholder:"Enter mobile number",otp_placeholder:"Enter 6-digit OTP",
  intake_placeholder:"Describe in your own words…",
  looks_right:"✓ This looks right",flag_wrong:"✕ This is wrong, remove it",
 },
 "hi-IN":{
  nav_home:"होम",nav_my_health:"मेरा स्वास्थ्य",nav_records:"रिकॉर्ड",nav_abha:"ABHA",nav_disconnect:"डिस्कनेक्ट करें",
  safety_line:"PRISM संरचित जानकारी एकत्र करता है। यह निदान नहीं करता और आपातकालीन देखभाल का विकल्प नहीं है।",
  speak:"🎙 बोलें",stop_recording:"⏹ रिकॉर्डिंग बंद करें",transcribing:"ट्रांसक्राइब हो रहा है…",speak_question:"🔊 प्रश्न सुनें",upload_instead:"📎 इसके बजाय फोटो अपलोड करें",
  continue_btn:"जारी रखें →",working:"कार्य जारी है…",finish_save:"पूरा करें और सहेजें →",saving:"सहेजा जा रहा है…",
  send_otp:"OTP भेजें →",sending:"भेजा जा रहा है…",verify_continue:"सत्यापित करें और जारी रखें →",verifying:"सत्यापित हो रहा है…",
  or_describe_own_words:"या अपने शब्दों में बताएं",
  mobile_placeholder:"मोबाइल नंबर दर्ज करें",otp_placeholder:"6-अंकीय OTP दर्ज करें",
  intake_placeholder:"अपने शब्दों में बताएं…",
  looks_right:"✓ यह सही है",flag_wrong:"✕ यह गलत है, हटाएं",
 },
 "ta-IN":{
  nav_home:"முகப்பு",nav_my_health:"எனது ஆரோக்கியம்",nav_records:"பதிவுகள்",nav_abha:"ABHA",nav_disconnect:"துண்டி",
  safety_line:"PRISM கட்டமைக்கப்பட்ட தகவல் சேகரிப்பை ஆதரிக்கிறது. இது நோயறிதல் செய்யாது, அவசர சிகிச்சைக்கு மாற்றாகாது.",
  speak:"🎙 பேசுங்கள்",stop_recording:"⏹ பதிவை நிறுத்தவும்",transcribing:"எழுத்தாக்கம் செய்யப்படுகிறது…",speak_question:"🔊 கேள்வியைக் கேளுங்கள்",upload_instead:"📎 பதிலாக புகைப்படத்தை பதிவேற்றவும்",
  continue_btn:"தொடரவும் →",working:"செயலாக்கத்தில்…",finish_save:"முடித்து சேமிக்கவும் →",saving:"சேமிக்கப்படுகிறது…",
  send_otp:"OTP அனுப்பவும் →",sending:"அனுப்பப்படுகிறது…",verify_continue:"சரிபார்த்து தொடரவும் →",verifying:"சரிபார்க்கப்படுகிறது…",
  or_describe_own_words:"அல்லது உங்கள் சொந்த வார்த்தைகளில் விவரிக்கவும்",
  mobile_placeholder:"மொபைல் எண்ணை உள்ளிடவும்",otp_placeholder:"6-இலக்க OTP-ஐ உள்ளிடவும்",
  intake_placeholder:"உங்கள் சொந்த வார்த்தைகளில் விவரிக்கவும்…",
  looks_right:"✓ இது சரியானது",flag_wrong:"✕ இது தவறு, அகற்றவும்",
 }
};

export function t(key:string,lang:string):string{
 return strings[lang]?.[key] ?? strings["en-IN"][key] ?? key;
}
