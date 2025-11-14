# AgoraMedAI - Setup and Testing Guide

This is a comprehensive healthcare platform with AI-powered voice assistance, real-time appointment booking, emergency alerts, and video consultations.

## Prerequisites

- Node.js 20+ and npm
- Firebase project
- Agora account with:
  - App ID and App Certificate
  - Customer ID and Customer Secret (for Conversational AI)
- OpenAI API key
- Azure Text-to-Speech API key
- Google Gemini API key

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and credentials in `.env.local`.

3. **Setup Firestore**
   
   This app uses Firebase Firestore for real-time data sync. Make sure to:
   - Create collections: `appointments` and `alerts`
   - Configure Firestore rules (see `firestore.rules`)
   - Update `src/firebase/config.ts` if needed

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## Testing Guide

### Phase 1: Sanity Check & Dummy Auth

1. **Run the App**
   - Run `npm run dev`
   - Open http://localhost:9002
   - ✅ Check: Does the app load?
   - ✅ Check console for 404 or Firebase errors

2. **Test Patient Login**
   - Click "Enter as Patient" button
   - ✅ Check: Redirected to `/patient/dashboard`?
   - ✅ Check: Open DevTools → Application → localStorage
   - ✅ Verify: `userRole` key set to `patient`

3. **Test Doctor Login**
   - Open incognito/new browser window
   - Go to http://localhost:9002
   - Click "Enter as Doctor"
   - ✅ Check: Redirected to `/doctor/dashboard`?
   - ✅ Verify: `userRole` key set to `doctor`

### Phase 2: Voice → AI → Firestore Pipeline

1. **Prepare**
   - Patient window: `/patient/dashboard`
   - Open Network tab in DevTools
   - Open Firebase Console → Firestore Database

2. **Test Voice Input (Speech-to-Text)**
   - Click the Voice Orb (microphone icon)
   - ✅ Check: Browser asks for microphone permission?
   - ✅ Check: Orb animates (pulse/glow) while listening?
   - Accept microphone permission and speak

3. **Test AI Intent Parsing**
   - Speak: "Book an appointment for tomorrow at 5 PM"
   - ✅ Check Network Tab: See request to `/api/ai/parse-intent`?
   - ✅ Check: Request payload has `{"transcript": "book an appointment..."}`?
   - ✅ Check: Response is 200 OK?
   - ✅ Check: Response JSON has `{"intent": "bookAppointment", "dateTime": "...", ...}`?

4. **Test Database Write**
   - ✅ Check Firebase Console: New document in `appointments` collection?
   - ✅ Verify fields: `patientId`, `doctorId: "dr-demo-id"`, `appointmentTime`

5. **Test Text Input Fallback**
   - Type in text area: "Book an appointment for 7 PM"
   - Click "Send Command"
   - ✅ Check: Same flow as voice (API call, Firestore write, toast notification)

### Phase 3: Real-Time UI Sync ("Magic")

1. **Prepare**
   - Window 1: Patient dashboard (`/patient/dashboard`)
   - Window 2: Doctor dashboard (`/doctor/dashboard`)
   - Position windows side-by-side

2. **Test Appointment Booking Sync**
   - In Window 1 (Patient): Book an appointment via voice or text
   - ✅ Check Window 1: New appointment card appears instantly in "Upcoming Appointments"?
   - ✅ Check Window 2: New appointment appears instantly in "Appointment Queue" table?

3. **Test Emergency Alert Sync**
   - In Window 1 (Patient): 
     - Say "Help me, I'm having severe chest pain!" OR
     - Click the red Emergency button (bottom-right)
   - ✅ Check Firebase Console: New document in `alerts` collection?
   - ✅ Check Window 2: Red "🔴 NEW EMERGENCY ALERT" box appears instantly?
   - ✅ Check: Alert shows patient ID and symptoms?

### Phase 4: Agora Video & AI Call

1. **Test Call Entry & Token**
   - In Window 1 (Patient): Click "Join Call" on an appointment
   - ✅ Check: Navigate to `/call/[appointmentId]` page?
   - ✅ Check Network Tab: Successful request to `/api/agora/token`?
   - ✅ Check: Response contains token string?

2. **Test AI Bot Start**
   - When call page loads:
   - ✅ Check Network Tab: Successful request to `/api/agora/start`?
   - ✅ Check: Local video feed appears?

3. **Test Video Stream**
   - ✅ Check: Your camera video shows in "Your video" area?
   - ✅ Check: AI bot joins (shows in remote video or starts transcription)?

4. **Test Call Exit**
   - Click "Leave" button
   - ✅ Check Network Tab: Successful request to `/api/agora/stop`?
   - ✅ Check: Video feed disconnects?
   - ✅ Check: Redirected back to patient dashboard?

### Phase 5: Polish & Feedback

1. **Test Audio Feedback (TTS)**
   - Book an appointment
   - ✅ Check: After toast appears, do you hear the app speak?
   - ✅ Listen: "Your appointment is confirmed for [time]"

2. **Test AI Fallback**
   - Say or type gibberish: "Blah blah shlorp"
   - ✅ Check: AI responds with `intent: "unknown"`?
   - ✅ Check: Toast shows fallback message?
   - ✅ Check: TTS says "Sorry, I didn't understand that command"?

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/parse-intent/    # Voice command intent parsing
│   │   └── agora/              # Agora token & bot management
│   ├── call/[appointmentId]/   # Video call page
│   ├── patient/dashboard/      # Patient dashboard
│   ├── doctor/dashboard/       # Doctor dashboard
│   └── page.tsx                # Landing page
├── components/
│   ├── patient/                # Patient components
│   ├── doctor/                 # Doctor components
│   └── shared/                 # Shared components
├── firebase/                   # Firebase configuration
├── ai/                         # AI flows (Genkit)
├── lib/                        # Utilities and helpers
└── hooks/                      # React hooks
```

## Key Features

### 1. Voice Assistant
- Browser-based speech recognition
- AI intent parsing (book appointments, emergency)
- Text-to-speech feedback
- Fallback text input

### 2. Real-Time Sync
- Firestore real-time listeners
- Instant updates across patient/doctor dashboards
- No refresh needed

### 3. Emergency Alerts
- Voice-activated: "I have severe chest pain"
- Button-activated: Red emergency button
- Instant notification to doctors

### 4. Video Consultations
- Agora RTC integration
- AI conversational bot
- Join calls from appointments

### 5. Authentication
- Demo localStorage-based auth
- Role-based routing (patient/doctor)

## Troubleshooting

### Voice Recognition Not Working
- Ensure you're using Chrome/Edge (WebKit Speech Recognition)
- Check microphone permissions
- Use text input as fallback

### Firestore Permission Errors
- Check `firestore.rules` configuration
- Ensure collections exist: `appointments`, `alerts`
- Verify Firebase credentials in `config.ts`

### Agora Connection Issues
- Verify all Agora credentials in `.env.local`
- Check CORS settings in Agora dashboard
- Ensure OpenAI and Azure TTS keys are valid

### AI Intent Parsing Errors
- Verify Google Gemini API key
- Check API quotas
- Review Network tab for error details

## Development Commands

```bash
# Run development server
npm run dev

# Run type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start

# Run Genkit dev server
npm run genkit:dev
```

## License

MIT
