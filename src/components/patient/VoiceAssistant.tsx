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

  const triggerEmergency = useCallback(async () => {
    setIsEmergencyDialogOpen(true);
    if (user) {
      try {
        await addDoc(collection(firestore, 'alerts'), {
          patientId: user.uid,
          type: 'emergency',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Failed to log emergency alert:', error);
      }
    }
  }, [user]);

  const processVoiceCommand = useCallback(async (transcript: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in first.',
        variant: 'destructive',
      });
      return;
    }

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
              patientId: user.uid,
              doctorId: 'dr-demo-id', // Dummy Doctor ID
              appointmentTime: new Date(data.dateTime),
              reason: data.reason,
              status: 'upcoming',
              type: 'Virtual',
              agoraChannelId: crypto.randomUUID(), // Unique channel ID for call
              createdAt: new Date(),
            });
            toast({
              title: 'Appointment Booked!',
              description: `Scheduled for ${new Date(data.dateTime).toLocaleString()} - ${data.reason}`,
            });
          } else {
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
              patientId: user.uid,
              symptom: data.symptom,
              severity: data.severity || 'low',
              timestamp: new Date(),
            });
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
          toast({
            title: 'Schedule',
            description: 'Check your upcoming appointments below.',
          });
          break;

        default:
          toast({
            title: 'Command Not Understood',
            description: 'Please try rephrasing your request.',
            variant: 'destructive',
          });
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [user, toast, triggerEmergency]);

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
        <div className="relative w-48 h-48 flex-shrink-0">
          <div
            onClick={startListening}
            className={`absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer transition-all
              ${isListening ? 'orb-speaking animate-pulse' : 'hover:scale-105'}
            `}
          >
            <div className="w-32 h-32 rounded-full bg-primary/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <Mic className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
          </div>
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
