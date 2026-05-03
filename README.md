# SwasthyaAI: Agentic AI Healthcare Traffic Controller

SwasthyaAI is a premium, intelligent healthcare navigation platform designed to provide instant symptom-based triage, multimodal AI guidance, and smart clinical routing. Built for the modern citizen, it transforms complex medical data into actionable insights within 60 seconds.

## 🚀 Key Features

- **Agentic AI Triage**: A sophisticated assessment engine combining rule-based safety protocols with Google Genkit-powered pathological insights (RED/YELLOW/GREEN severity classification).
- **Agentic Medical Imaging**: Multimodal AI analysis for clinical scans (X-rays, MRIs, CTs) that detects anatomical anomalies and generates structured draft reports using Gemini 2.5 Flash.
- **Bilingual AI Assistant**: Interactive voice and text assistant supporting English, Hindi, and 9+ regional languages, featuring real-time speech-to-text and high-quality clinical text-to-speech.
- **Consultation Mode**: A physician-optimized dashboard that synthesizes patient history and triage data into structured AI summaries for faster doctor-patient communication.
- **Doctor Buddy Discovery**: A patient-side clinical directory to find verified specialists nearby, view professional credentials, and initiate appointment requests.
- **Interactive Facility Finder**: Real-time map (OpenStreetMap/Overpass API) with specialized SOS proximity detection for emergency trauma centers and pharmacies.
- **Public Health Surveillance**: Anonymized regional epidemiological trends and disease surveillance dashboard providing real-time clinical monitoring.
- **Health Records (PHR)**: Secure clinical profile management with ABHA ID integration and professional PDF/JSON (FHIR-style) export capabilities.
- **Emergency SOS**: A high-priority activation system that alerts emergency contacts and identifies the nearest trauma support with live location broadcasting.

## 🎨 Professional Themes

SwasthyaAI now supports a toggleable **Dual-Theme System**:
- **Medical Dark (Default)**: A high-performance, dark navy and teal theme designed for reduced eye strain in clinical environments.
- **Clinical Light**: A professional, pure-white background theme that maintains dark medical panels and teal accents for maximum accessibility.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI (Radix), Lucide Icons
- **AI Engine**: Google Genkit v1.x, Gemini 2.5 Flash (Multimodal), Imagen 4
- **Backend**: Firebase (Authentication, Firestore, App Hosting, Storage)
- **Mapping**: Leaflet, OpenStreetMap, Nominatim API
- **Data Viz**: Recharts
- **Utilities**: jsPDF, Zod, Date-fns

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Firebase Project (with Firestore and Auth enabled)
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

## 🛡️ Clinical Safety & Privacy

SwasthyaAI is a **Triage Guidance Tool**, not a diagnostic platform.
- **No Diagnosis**: The system identifies clinical urgency levels, not specific diseases.
- **No Prescription**: AI flows are strictly prohibited from suggesting or prescribing medications.
- **Safety Protocol**: Rule-based logic (`triage-engine.ts`) always overrides AI for "Red Flag" symptoms.
- **Data Privacy**: All patient data is encrypted in transit and at rest. Public health trends are calculated using strictly anonymized aggregates.

## 📂 Project Structure

- `src/ai/flows`: Genkit AI clinical decision and imaging flows.
- `src/app/triage`: Core hybrid assessment engine.
- `src/app/consultation`: Physician-optimized data views.
- `src/app/imaging`: Multimodal radiology assistance.
- `src/app/facilities`: Geolocation and mapping services.
- `src/lib/triage-engine.ts`: Local rule-based safety validator.

---
Built with ❤️ for the future of clinical intelligence.
