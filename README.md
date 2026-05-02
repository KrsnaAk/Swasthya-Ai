# SwasthyaAI: Agentic AI Healthcare Traffic Controller

SwasthyaAI is a premium, intelligent healthcare navigation platform designed to provide instant symptom-based triage, multilingual AI guidance, and smart clinical routing. Built for every citizen, it transforms complex medical data into actionable insights within 60 seconds.

## 🚀 Key Features

- **Agentic AI Triage**: A sophisticated assessment engine combining rule-based safety protocols with Google Genkit-powered pathological insights (RED/YELLOW/GREEN severity classification).
- **Bilingual AI Assistant**: Interactive voice and text assistant supporting English and Hindi, featuring real-time speech-to-text and high-quality clinical text-to-speech.
- **Consultation Mode**: A high-density, physician-optimized dashboard that generates structured clinical summaries for faster doctor-patient communication.
- **Facility Finder**: Real-time interactive map (OpenStreetMap) with specialized SOS proximity detection for emergency trauma centers.
- **Public Health Monitoring**: Anonymized regional epidemiological trends and disease surveillance dashboard for public health demonstration.
- **Health Records (Patient ID)**: Secure clinical profile management with HIPAA-inspired storage and one-tap PDF/JSON (FHIR-style) export capabilities.
- **Preventive Analytics**: Lifestyle-based wellness scoring and personalized risk assessment for chronic conditions like diabetes and heart disease.
- **Emergency SOS**: A dedicated high-priority activation system that alerts emergency contacts and identifies the nearest trauma support.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Lucide Icons
- **AI Engine**: Google Genkit v1.x, Gemini 2.5 Flash, Imagen 4, Veo
- **Backend**: Firebase (Authentication, Firestore, App Hosting)
- **Mapping**: Leaflet, React-Leaflet, OpenStreetMap
- **Data Viz**: Recharts
- **Utilities**: jsPDF, Zod, Date-fns

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Firebase Project
- Google AI API Key

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key
   # Firebase config is automatically handled by App Hosting
   ```

### Running the App
- Development mode:
  ```bash
  npm run dev
  ```
- Genkit Developer UI:
  ```bash
  npm run genkit:dev
  ```

## 🛡️ Clinical Safety & Disclaimers

SwasthyaAI is a **Triage Guidance Tool**, not a diagnostic platform.
- **No Diagnosis**: The system identifies clinical urgency levels, not specific diseases.
- **No Prescription**: AI flows are strictly prohibited from suggesting medications.
- **Safety Protocol**: Rule-based logic always overrides AI for "Red Flag" symptoms.
- **Emergency Priority**: Critical symptoms trigger immediate 108/112 emergency routing.

## 📂 Project Structure

- `src/ai/flows`: Genkit AI clinical decision flows.
- `src/app/triage`: Core hybrid assessment engine.
- `src/app/consultation`: Physician-optimized data views.
- `src/app/facilities`: Geolocation and mapping services.
- `src/app/public-health`: Anonymized aggregation logic.
- `src/lib/triage-engine.ts`: Local rule-based safety validator.

---
Built with ❤️ for the future of healthcare.