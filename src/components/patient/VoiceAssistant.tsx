'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Mic, Send } from 'lucide-react';
import { useState, useTransition, useCallback } from 'react';
import { analyzeSymptoms, AnalyzeSymptomsOutput } from '@/ai/flows/voice-assistant-symptom-analysis';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { useUser } from '@/firebase/auth/use-user';
import { firestore } from '@/firebase/index';
import { addDoc, collection } from 'firebase/firestore';

export function VoiceAssistant() {
  const { user } = useUser();
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // Text-to-Speech helper function
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const triggerEmergency = useCallback(async () => {
    setIsEmergencyDialogOpen(true);
    speak('Emergency alert triggered. Help is on the way.');
    const userId = user?.uid || 'demo-patient-' + Date.now();
    const userName = user?.displayName || 'Demo Patient';
    
    try {
      await addDoc(collection(firestore, 'emergencyAlerts'), {
        patientId: userId,
        patientName: userName,
        timestamp: new Date(),
        status: 'active',
        location: 'Unknown',
        reason: 'Emergency assistance requested via voice command',
      });
    } catch (error) {
      console.error('Failed to log emergency alert:', error);
    }
  }, [user, speak]);

  const processVoiceCommand = useCallback(async (transcript: string) => {
    // Generate a demo user ID if user is not available
    const userId = user?.uid || 'demo-patient-' + Date.now();

    try {
      // Call AI intent parser
      const response = await fetch('/api/ai/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }

      const data = await response.json();

      // Handle different intents
      switch (data.intent) {
        case 'bookAppointment':
          if (data.dateTime && data.reason) {
            await addDoc(collection(firestore, 'appointments'), {
              patientId: userId,
              doctorId: 'dr-demo-id', // Dummy Doctor ID
              appointmentTime: new Date(data.dateTime),
              reason: data.reason,
              status: 'upcoming',
              type: 'Virtual',
              agoraChannelId: crypto.randomUUID(), // Unique channel ID for call
              createdAt: new Date(),
            });
            const confirmationMessage = `Your appointment is confirmed for ${new Date(data.dateTime).toLocaleString()}`;
            speak(confirmationMessage);
            toast({
              title: 'Appointment Booked!',
              description: `Scheduled for ${new Date(data.dateTime).toLocaleString()} - ${data.reason}`,
            });
          } else {
            speak('Sorry, I could not understand the appointment details. Please try again.');
            toast({
              title: 'Incomplete Information',
              description: 'Could not extract appointment details. Please try again.',
              variant: 'destructive',
            });
          }
          break;

        case 'reportSymptom':
          if (data.symptom) {
            await addDoc(collection(firestore, 'symptoms'), {
              patientId: userId,
              symptom: data.symptom,
              severity: data.severity || 'low',
              timestamp: new Date(),
            });
            speak('Your symptom has been logged. Your doctor will be notified.');
            toast({
              title: 'Symptom Logged',
              description: 'Your doctor has been notified.',
            });
            if (data.severity === 'high') {
              triggerEmergency();
            }
          }
          break;

        case 'emergency':
          triggerEmergency();
          break;

        case 'showSchedule':
          speak('Check your upcoming appointments below.');
          toast({
            title: 'Schedule',
            description: 'Check your upcoming appointments below.',
          });
          break;

        default:
          speak('I did not understand that command. Please try again.');
          toast({
            title: 'Command Not Understood',
            description: 'Please try rephrasing your request.',
            variant: 'destructive',
          });
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      speak('Sorry, there was an error processing your command.');
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [user, toast, triggerEmergency, speak]);

  const startListening = () => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Not Supported',
        description: 'Voice commands are not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    speak('Listening. How can I help you?');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(transcript);
      toast({
        title: 'Voice Command Received',
        description: `Processing: "${transcript}"`,
      });
      processVoiceCommand(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      speak('Sorry, I could not hear you. Please try again.');
      toast({
        title: 'Voice Recognition Failed',
        description: 'Could not capture voice. Please try again.',
        variant: 'destructive',
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSymptomAnalysis = () => {
    if (!symptoms.trim()) {
      toast({
        title: 'No symptoms entered',
        description: 'Please describe your symptoms before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await analyzeSymptoms({
          symptomsDescription: symptoms,
        });
        setAnalysisResult(result);
        setIsDialogOpen(true);
      } catch (error) {
        toast({
          title: 'Analysis Failed',
          description:
            'Could not analyze symptoms. Please try again. ' +
            (error instanceof Error ? error.message : ''),
          variant: 'destructive',
        });
        setAnalysisResult(null);
      }
    });
  };

  const getUrgencyBadgeVariant = (
    urgency: 'low' | 'medium' | 'high'
  ): 'default' | 'secondary' | 'destructive' => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Voice Assistant</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : 'bg-green-500'}`}></span>
            </span>
            {isListening ? 'Listening...' : 'Ready'}
          </div>
        </div>
        <CardDescription>
          Tap the orb to speak or type your command below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-64 h-64 flex-shrink-0">
          {/* Outer pulsing glow ring */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 animate-pulse scale-110'
                : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
            }`}
            style={{
              filter: 'blur(20px)',
            }}
          />
          
          {/* Middle ring with rotation */}
          <div
            className={`absolute inset-4 rounded-full transition-all duration-500 ${
              isListening
                ? 'bg-gradient-to-tr from-red-400/40 to-pink-400/40 animate-spin-slow'
                : 'bg-gradient-to-tr from-blue-400/30 to-purple-400/30'
            }`}
            style={{
              boxShadow: isListening
                ? '0 0 60px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.3)'
                : '0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 15px rgba(59, 130, 246, 0.2)',
            }}
          />
          
          {/* Voice Orb - clickable */}
          <div
            onClick={startListening}
            className={`absolute inset-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-105 shadow-2xl'
                : 'bg-gradient-to-br from-blue-600 to-purple-700 hover:scale-110 hover:shadow-2xl'
            }`}
            style={{
              boxShadow: isListening
                ? '0 0 80px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2)'
                : '0 0 50px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Microphone icon */}
            <div className="relative">
              <Mic className={`h-16 w-16 text-white transition-all duration-300 ${
                isListening ? 'animate-bounce' : ''
              }`} />
              
              {/* Pulsing ring around mic when listening */}
              {isListening && (
                <>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-20 w-20 rounded-full border-4 border-white/30 animate-ping" />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-24 w-24 rounded-full border-2 border-white/20 animate-ping animation-delay-150" />
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Central glow effect */}
          <div
            className={`absolute inset-16 rounded-full transition-opacity duration-300 ${
              isListening ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />
        </div>
        <div className="w-full space-y-4">
          <Textarea
            placeholder="e.g., Book an appointment with a doctor for tomorrow at 3 PM for my cough..."
            className="min-h-[100px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={isAnalyzing || isListening}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => processVoiceCommand(symptoms)}
              disabled={isAnalyzing || isListening || !symptoms.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'Processing...' : 'Process Command'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSymptomAnalysis}
              disabled={isAnalyzing || isListening || !symptoms.trim()}
            >
              Analyze Symptoms
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground justify-center">
        Powered by Gemini AI ✨
      </CardFooter>

      {/* Emergency Dialog */}
      <AlertDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Emergency Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This appears to be an emergency situation. Would you like to call emergency services?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="tel:108" className="bg-destructive hover:bg-destructive/90">
                Call 108 (Emergency)
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Symptom Analysis Dialog */}
      {analysisResult && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center justify-between">
                Symptom Analysis Report
                <Badge variant={getUrgencyBadgeVariant(analysisResult.urgencyLevel)}>
                  Urgency: {analysisResult.urgencyLevel}
                </Badge>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Based on your symptoms, here is a preliminary analysis. This is
                not a medical diagnosis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              <div>
                <h4 className="font-semibold mb-2">Potential Diagnoses:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.diagnosisSuggestions.map((diag, i) => (
                    <li key={i}>{diag}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <p className="text-sm text-muted-foreground">{analysisResult.recommendations}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Got it</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
