# AgoraMedAI - Complete Healthcare Platform

**Team: OG GROUP**

A comprehensive, production-ready healthcare management platform with real-time features, voice AI integration, and multi-role support.

## Features

### 🎤 AI Voice Assistant
- Voice command parsing using agora 
- Book appointments via voice: "Book an appointment for tomorrow at 4 PM for my cough"
- Trigger emergency alerts: "Help, I've fallen!"
- Symptom analysis with AI-powered diagnosis suggestions
- **Audio Feedback (TTS)**: AI assistant speaks back confirmations using browser's built-in text-to-speech
- **Enhanced Voice Orb**: Beautiful multi-layered design with pulsing effects and animations

### 🔥 Real-Time Firestore Integration
- Live appointment updates across patient and doctor dashboards
- Instant emergency alert notifications
- Real-time medication and routine tracking
- Automatic synchronization without page refresh
- **Visual feedback**: New appointments pulse and highlight for 5 seconds (the "wow" moment!)

### 🚨 Emergency Alert System
- One-click emergency button for patients
- Real-time alerts displayed on doctor dashboards
- Voice-activated emergency triggers
- Location and timestamp tracking

### 👥 Multi-Role Support
- **Patient Dashboard**: Manage appointments, medications, daily routines
- **Doctor Dashboard**: View appointment queue, patient list, emergency alerts
- Anonymous authentication for easy demo access

### 📹 Agora Video Integration
- Real-time video consultations
- AI-powered conversational assistant during calls
- Live transcription support
- Secure token-based authentication

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.local.template` file to `.env.local` and fill in your credentials:

```bash
cp .env.local.template .env.local
```

#### Required Environment Variables:

**Firebase Configuration:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase Console > Project Settings
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Google AI (for voice intent parsing):**
- `GOOGLE_GENAI_API_KEY` - From https://aistudio.google.com/app

**Agora (for video calls):**
- `NEXT_PUBLIC_AGORA_APP_ID` - From Agora Console
- `AGORA_APP_CERTIFICATE` - From Agora Console
- `AGORA_CUSTOMER_ID` - From Agora RESTful API
- `AGORA_CUSTOMER_SECRET` - From Agora RESTful API

**Optional (for Agora AI features):**
- `OPENAI_API_KEY` - For AI conversational bot
- `AZURE_TTS_API_KEY` - For text-to-speech

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:9002

## Testing the Features

### Phase 1: Authentication and Navigation
1. Click "Login as Patient" - Creates anonymous user and redirects to `/patient/dashboard`
2. Click "View Doctor Dashboard (Demo)" - Redirects to `/doctor/dashboard`
3. ✅ Both dashboards should load successfully

### Phase 2: Voice-to-Database Pipeline
1. **As Patient:** Click the VOICE_ORB (microphone icon)
2. Type or say: "Book an appointment for tomorrow at 4 PM for my cough"
3. Click "Process Command"
4. ✅ **Browser:** Check Network tab for successful `/api/ai/parse-intent` call
5. ✅ **Firestore:** New document appears in `appointments` collection instantly

### Phase 3: Real-Time Sync (The "Wow" Moment)
1. **Patient Dashboard:** Look at "Upcoming Appointments" card
2. **Doctor Dashboard:** Look at "Today's Appointment Queue"
3. ✅ The new appointment appears on **both screens simultaneously** without refresh!

### Phase 4: Real-Time Emergency Alert
1. **As Patient:** Click the red Emergency Button (bottom right)
2. Confirm the emergency
3. **As Doctor:** Watch the doctor dashboard
4. ✅ A red emergency alert box instantly appears at the top of the Doctor's screen

### Phase 5: Agora AI Call
1. **As Patient:** Click "Join Call" button on an appointment (future enhancement)
2. ✅ **Network tab:** Successful calls to `/api/agora/token` and `/api/agora/start`
3. ✅ **UI:** Video feed loads and AI Assistant joins the call

## API Routes

| Route | Purpose | Used By |
|-------|---------|---------|
| `/api/ai/parse-intent` | Parse voice commands using AI | VoiceAssistant |
| `/api/agora/token` | Generate Agora RTC tokens | useAgora hook |
| `/api/agora/start` | Start AI conversational bot | useAgora hook |
| `/api/agora/stop` | Stop AI conversational bot | useAgora hook |

## Firestore Collections

### `appointments`
- `patientId` - Patient user ID
- `doctorId` - Doctor user ID
- `appointmentTime` - Timestamp
- `type` - "Virtual" or "In-Person"
- `status` - "scheduled", "checked_in", "waiting", etc.
- `reason` - Appointment reason
- `specialty` - Medical specialty

### `emergencyAlerts`
- `patientId` - Patient user ID
- `patientName` - Patient display name
- `timestamp` - When alert was triggered
- `status` - "active" or "resolved"
- `location` - Patient location
- `reason` - Emergency description

## Technology Stack

- **Frontend:** Next.js 15, React 18, TailwindCSS
- **UI Components:** Radix UI, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Anonymous)
- **AI/ML:** Google AI (Gemini), Genkit
- **Video:** Agora RTC SDK
- **Real-time:** Firestore onSnapshot listeners

## Project Structure

```
src/
├── ai/
│   ├── flows/
│   │   ├── intent-parser.ts          # Voice command parsing
│   │   ├── voice-assistant-symptom-analysis.ts
│   │   └── voice-assistant-medication-reminders.ts
│   └── genkit.ts                      # Genkit configuration
├── app/
│   ├── api/
│   │   ├── ai/parse-intent/           # Intent parsing API
│   │   └── agora/                     # Agora token/start/stop APIs
│   ├── doctor/dashboard/              # Doctor dashboard
│   ├── patient/dashboard/             # Patient dashboard
│   └── page.tsx                       # Landing page
├── components/
│   ├── doctor/
│   │   ├── AppointmentQueue.tsx      # Real-time appointments
│   │   └── EmergencyAlerts.tsx       # Real-time emergency alerts
│   ├── patient/
│   │   ├── VoiceAssistant.tsx        # AI voice interface
│   │   └── UpcomingAppointments.tsx  # Real-time appointments
│   └── shared/
│       └── EmergencyButton.tsx       # Emergency trigger
├── firebase/
│   ├── firestore/
│   │   └── use-collection.tsx        # Real-time Firestore hook
│   └── index.ts                      # Firebase initialization
└── hooks/
    └── use-agora.ts                  # Agora video hook
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Type checking with TypeScript
npm run genkit:dev   # Start Genkit development server
```


## License

All rights reserved - OG GROUP © 2024
