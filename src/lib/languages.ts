export type SupportedLanguage = {
  code: string;
  name: string;
  bcp47: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', bcp47: 'en-US' },
  { code: 'hi', name: 'Hindi (हिन्दी)', bcp47: 'hi-IN' },
  { code: 'bn', name: 'Bengali (বাংলা)', bcp47: 'bn-IN' },
  { code: 'ta', name: 'Tamil (தமிழ்)', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu (తెలుగు)', bcp47: 'te-IN' },
  { code: 'mr', name: 'Marathi (मराठी)', bcp47: 'mr-IN' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', bcp47: 'gu-IN' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', bcp47: 'kn-IN' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', bcp47: 'ml-IN' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', bcp47: 'pa-IN' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', bcp47: 'or-IN' },
];
