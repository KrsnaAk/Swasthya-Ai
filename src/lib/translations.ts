type TranslationKeys = 
  | 'startTriage' 
  | 'speakSymptoms' 
  | 'findHospital' 
  | 'emergency' 
  | 'stopSpeaking' 
  | 'listening' 
  | 'symptomsPlaceholder' 
  | 'describeSymptoms'
  | 'chatbot_title'
  | 'chatbot_start_triage'
  | 'chatbot_find_hospital'
  | 'chatbot_emergency_help'
  | 'chatbot_generate_summary'
  | 'chatbot_view_history'
  | 'chatbot_disclaimer'
  | 'chatbot_q1'
  | 'chatbot_q2'
  | 'chatbot_q3'
  | 'chatbot_q4'
  | 'chatbot_q5'
  | 'chatbot_q6'
  | 'chatbot_q7'
  | 'chatbot_q8'
  | 'chatbot_q_analyze'
  | 'chatbot_analysis_complete'
  | 'chatbot_input_placeholder'
  | 'chatbot_mic_error'
  | 'chatbot_why_status'
  | 'chatbot_ai_summary'
  | 'chatbot_rec_action';

const translations: Record<string, Record<TranslationKeys, string>> = {
  en: {
    startTriage: 'Start Triage',
    speakSymptoms: 'Speak Symptoms',
    findHospital: 'Find Hospital',
    emergency: 'Emergency',
    stopSpeaking: 'Stop Speaking',
    listening: 'Listening...',
    symptomsPlaceholder: 'Describe how you are feeling...',
    describeSymptoms: 'Describe your symptoms',
    chatbot_title: 'Healthcare Assistant',
    chatbot_start_triage: 'Start symptom check',
    chatbot_find_hospital: 'Find nearest hospital',
    chatbot_emergency_help: 'Emergency help',
    chatbot_generate_summary: 'Generate doctor summary',
    chatbot_view_history: 'View my health history',
    chatbot_disclaimer: 'DISCLAIMER: This is not a medical diagnosis. In emergencies, contact a doctor or emergency service immediately.',
    chatbot_q1: 'What symptoms are you experiencing?',
    chatbot_q2: 'Since how long? (e.g., 2 days)',
    chatbot_q3: 'How severe is your discomfort on a scale of 1 to 10?',
    chatbot_q4: 'Are you experiencing any chest pain?',
    chatbot_q5: 'Are you having any difficulty breathing?',
    chatbot_q6: 'Did you faint or become unconscious at any point?',
    chatbot_q7: 'Do you have a high fever?',
    chatbot_q8: 'Do you have any chronic conditions (like Diabetes or Asthma) or are you elderly/pregnant?',
    chatbot_q_analyze: 'Do you want me to analyze this now?',
    chatbot_analysis_complete: 'Analysis complete. Here is your triage assessment:',
    chatbot_input_placeholder: 'Type your message...',
    chatbot_mic_error: 'Microphone permission is required for voice input. You can still type your symptoms.',
    chatbot_why_status: 'Why this status?',
    chatbot_ai_summary: 'AI Summary',
    chatbot_rec_action: 'Recommended Action',
  },
  hi: {
    startTriage: 'ट्राइएज शुरू करें',
    speakSymptoms: 'लक्षण बोलें',
    findHospital: 'अस्पताल खोजें',
    emergency: 'आपातकालीन',
    stopSpeaking: 'बोलना बंद करें',
    listening: 'सुन रहा हूँ...',
    symptomsPlaceholder: 'बताएं कि आप कैसा महसूस कर रहे हैं...',
    describeSymptoms: 'अपने लक्षणों का वर्णन करें',
    chatbot_title: 'स्वास्थ्य सहायक',
    chatbot_start_triage: 'लक्षण जांच शुरू करें',
    chatbot_find_hospital: 'नज़दीकी अस्पताल खोजें',
    chatbot_emergency_help: 'इमरजेंसी सहायता',
    chatbot_generate_summary: 'डॉक्टर सारांश बनाएं',
    chatbot_view_history: 'मेरा इतिहास देखें',
    chatbot_disclaimer: 'अस्वीकरण: यह मेडिकल डायग्नोसिस नहीं है। आपातकाल में तुरंत डॉक्टर या इमरजेंसी सेवा से संपर्क करें।',
    chatbot_q1: 'आपको कौन-कौन से लक्षण हैं?',
    chatbot_q2: 'यह कितने समय से हो रहा है? (जैसे, 2 दिन)',
    chatbot_q3: 'आपकी परेशानी 1 से 10 में कितनी गंभीर है?',
    chatbot_q4: 'क्या आपको सीने में दर्द है?',
    chatbot_q5: 'क्या आपको सांस लेने में दिक्कत है?',
    chatbot_q6: 'क्या आप बेहोश हुए थे?',
    chatbot_q7: 'क्या आपको तेज़ बुखार है?',
    chatbot_q8: 'क्या आप बुजुर्ग, गर्भवती हैं या आपको कोई पुरानी बीमारी है?',
    chatbot_q_analyze: 'क्या मैं अब इसका विश्लेषण करूं?',
    chatbot_analysis_complete: 'विश्लेषण पूरा हुआ। यहाँ आपका ट्राइएज मूल्यांकन है:',
    chatbot_input_placeholder: 'अपना संदेश लिखें...',
    chatbot_mic_error: 'वॉयस इनपुट के लिए माइक्रोफ़ोन अनुमति आवश्यक है। आप अभी भी अपने लक्षण टाइप कर सकते हैं।',
    chatbot_why_status: 'यह स्थिति क्यों है?',
    chatbot_ai_summary: 'AI सारांश',
    chatbot_rec_action: 'अनुशंसित कार्रवाई',
  },
  // ... rest of languages kept as is
};

export function t(key: TranslationKeys, langCode: string = 'en'): string {
  const lang = translations[langCode] || translations['en'];
  return lang[key] || translations['en'][key];
}