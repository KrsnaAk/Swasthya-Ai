# **App Name**: SwasthyaAI

## Core Features:

- Secure User Authentication: Allows citizens to securely register and log in using email and password, powered by Firebase Authentication.
- AI-Powered Triage & Routing: A conversational tool using Gemini API to analyze reported symptoms (text or voice) for severity and suggest appropriate next steps: home care, clinic visit, emergency, or hospital. This is not a medical diagnosis; in emergencies, contact a doctor or emergency service immediately.
- Symptom Input Interface: Provides intuitive UI for text-based symptom entry and integrates Google Speech-to-Text for voice input, catering to multilingual users.
- Healthcare Facility Finder: Displays nearest hospitals and clinics on an interactive map using Google Maps integration, based on the user's location or input.
- Personal Health Dashboard: A centralized dashboard for quick access to Start Triage, Hospital Finder, a placeholder for Health Records (ABHA), and basic Preventive Health information.
- Triage History & Records Mock: Allows users to view a summary of past triage assessments, acting as a mock for more detailed health records integration (ABHA). Data is stored securely in Cloud Firestore.

## Style Guidelines:

- Primary action color: A vibrant, warm orange (#F0A521) for key interactive elements and accents, conveying urgency and support without being alarming.
- Background color: A very dark, subtle, warm grey (#1D1B17), providing a 'dark healthcare UI' feel that reduces eye strain and highlights interactive elements.
- Secondary accent color: A muted, deep red (#C43B33) for complementary UI elements or subtle alerts, maintaining a professional yet empathetic aesthetic.
- Headlines and prominent text: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and crisp presentation suitable for AI-driven services.
- Body text and detailed information: 'Inter' (sans-serif) for its high legibility and neutral, professional appearance, ensuring clarity in healthcare contexts.
- Utilize a consistent set of clean, minimalist line icons. Prioritize clarity and immediate recognition, especially for critical features like Triage, Hospitals, and SOS, fitting the 'healthcare' and 'AI' themes.
- Implement a responsive, card-based layout with generous whitespace. This ensures an uncluttered user interface across different screen sizes, emphasizing readability and easy navigation within the dark theme.
- Incorporate subtle, swift, and functional transitions for state changes and navigation. Loading indicators will be unobtrusive yet clearly communicate ongoing processes, enhancing the feeling of responsiveness without distracting from critical health information.