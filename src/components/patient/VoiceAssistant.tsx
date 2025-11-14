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
import { useState, useTransition, useEffect, useRef } from 'react';
import { analyzeSymptoms, AnalyzeSymptomsOutput } from '@/ai/flows/voice-assistant-symptom-analysis';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { useAgora } from '@/hooks/use-agora';
import { useUser } from '@/firebase/auth/use-user';
import { createAppointment, createEmergencyAlert } from '@/lib/firestore-helpers';
import { format, addDays, addHours, parse } from 'date-fns';

export function VoiceAssistant() {
  const { user } = useUser();
  const channelName = user ? `voice-assistant-${user.uid}` : '';
  const { isConnected, join, leave } = useAgora(channelName, user?.uid ?? null);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleVoiceCommand(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Voice Recognition Error',
          description: 'Could not process your voice. Please try again.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const parseTimeToDate = (timeStr: string): string => {
    const now = new Date();
    const lowerTime = timeStr.toLowerCase();

    // Handle relative times
    if (lowerTime.includes('tomorrow')) {
      const tomorrow = addDays(now, 1);
      const timeMatch = timeStr.match(/(\d{1,2})\s*(am|pm)/i);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const isPM = timeMatch[2].toLowerCase() === 'pm';
        const hour24 = isPM && hours !== 12 ? hours + 12 : hours;
        tomorrow.setHours(hour24, 0, 0, 0);
      } else {
        tomorrow.setHours(10, 0, 0, 0); // Default to 10 AM
      }
      return tomorrow.toISOString();
    }

    // Handle specific times today
    const timeMatch = timeStr.match(/(\d{1,2})\s*(am|pm)?/i);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const isPM = timeMatch[2]?.toLowerCase() === 'pm' || hours >= 12;
      const hour24 = isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours;
      const targetDate = new Date(now);
      targetDate.setHours(hour24, 0, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (targetDate < now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      return targetDate.toISOString();
    }

    // Handle day names (Friday, Monday, etc.)
    const dayMatch = lowerTime.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (dayMatch) {
      const targetDay = dayMatch[1];
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = now.getDay();
      const targetDayIndex = daysOfWeek.indexOf(targetDay.toLowerCase());
      let daysToAdd = targetDayIndex - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      
      const targetDate = addDays(now, daysToAdd);
      const timeMatch = timeStr.match(/(\d{1,2})\s*(am|pm)/i);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const isPM = timeMatch[2].toLowerCase() === 'pm';
        const hour24 = isPM && hours !== 12 ? hours + 12 : hours;
        targetDate.setHours(hour24, 0, 0, 0);
      } else {
        targetDate.setHours(10, 0, 0, 0);
      }
      return targetDate.toISOString();
    }

    // Default to 1 hour from now
    return addHours(now, 1).toISOString();
  };

  const handleVoiceCommand = async (transcript: string) => {
    startTransition(async () => {
      try {
        // Call the parse-intent API
        const response = await fetch('/api/ai/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript }),
        });

        if (!response.ok) {
          throw new Error('Failed to parse intent');
        }

        const result = await response.json();

        if (result.intent === 'bookAppointment') {
          // Create appointment in Firestore
          const appointmentTime = result.dateTime ? parseTimeToDate(result.dateTime) : addHours(new Date(), 1).toISOString();
          
          await createAppointment({
            patientId: user?.uid || 'demo-patient-id',
            doctorId: 'dr-demo-id',
            appointmentTime,
            status: 'scheduled',
            type: 'Virtual',
          });

          const formattedTime = format(new Date(appointmentTime), 'MMMM d, yyyy \'at\' h:mm a');
          
          toast({
            title: 'Appointment Booked',
            description: `Your appointment is scheduled for ${formattedTime}`,
          });

          // TTS feedback
          speakText(`Your appointment is confirmed for ${formattedTime}`);
        } else if (result.intent === 'emergency') {
          // Create emergency alert in Firestore
          await createEmergencyAlert({
            patientId: user?.uid || 'demo-patient-id',
            symptoms: result.symptoms || transcript,
            status: 'active',
          });

          toast({
            title: '🔴 Emergency Alert Sent',
            description: 'Notifying doctors immediately. Help is on the way!',
            variant: 'destructive',
          });

          // TTS feedback
          speakText('Emergency alert has been sent. A doctor will contact you immediately.');
        } else {
          toast({
            title: 'Command Not Recognized',
            description: "Sorry, I didn't understand that. Try saying 'book an appointment' or describe your symptoms.",
          });

          // TTS feedback
          speakText("Sorry, I didn't understand that command.");
        }
      } catch (error) {
        console.error('Error processing command:', error);
        toast({
          title: 'Processing Failed',
          description: 'Could not process your command. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: 'Listening...',
          description: 'Speak now to book an appointment or report symptoms',
        });
      } else {
        toast({
          title: 'Voice Recognition Not Available',
          description: 'Please use the text input instead.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) {
      toast({
        title: 'No input',
        description: 'Please enter a command.',
        variant: 'destructive',
      });
      return;
    }
    handleVoiceCommand(inputText);
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Active
          </div>
        </div>
        <CardDescription>
          Click the microphone or type to book appointments, report symptoms, or get help.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
          <div
            onClick={handleMicClick}
            className={`absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer transition-all
              ${isListening ? 'orb-speaking' : ''}
            `}
          >
            <div className="w-32 h-32 rounded-full bg-primary/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <Mic className={`h-10 w-10 text-primary-foreground ${isListening ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4">
          <Textarea
            placeholder="e.g., 'Book an appointment for tomorrow at 5 PM' or 'I have severe chest pain'"
            className="min-h-[100px] text-base"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
          />
          <Button
            className="w-full"
            onClick={handleTextSubmit}
            disabled={isProcessing}
          >
            <Send className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Send Command'}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground justify-center">
        Powered by AI Voice Recognition & Agora ✨
      </CardFooter>

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
