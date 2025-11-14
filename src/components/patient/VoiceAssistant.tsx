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
import { useState, useTransition } from 'react';
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
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function VoiceAssistant() {
  const { user } = useUser();
  const firestore = useFirestore();
  const channelName = user ? `voice-assistant-${user.uid}` : '';
  const { isConnected, join, leave } = useAgora(channelName, user?.uid ?? null);
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleVoiceCommand = async (command: string) => {
    try {
      // Parse intent using the AI API
      const response = await fetch('/api/ai/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceCommand: command }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }

      const result = await response.json();

      // Handle different intents
      if (result.intent === 'book_appointment' && user) {
        // Create appointment in Firestore
        const appointmentsRef = collection(firestore, 'appointments');
        await addDoc(appointmentsRef, {
          patientId: user.uid,
          patientName: user.displayName || 'Patient',
          doctorId: 'demo-doctor-id', // In a real app, this would be selected/matched
          doctorName: 'Dr. Available',
          specialty: result.parameters.specialty || 'General',
          appointmentTime: serverTimestamp(), // In a real app, parse the date/time
          type: 'Virtual',
          status: 'scheduled',
          reason: result.parameters.reason || command,
          createdAt: serverTimestamp(),
        });

        toast({
          title: 'Appointment Booked',
          description: `Your appointment has been scheduled. Reason: ${result.parameters.reason || 'General consultation'}`,
        });
      } else if (result.intent === 'emergency' && user) {
        // Trigger emergency alert
        const emergencyAlertsRef = collection(firestore, 'emergencyAlerts');
        await addDoc(emergencyAlertsRef, {
          patientId: user.uid,
          patientName: user.displayName || 'Unknown Patient',
          timestamp: serverTimestamp(),
          status: 'active',
          location: 'Unknown',
          reason: result.parameters.reason || command,
        });

        toast({
          title: 'Emergency Alert Sent',
          description: 'Emergency services have been notified.',
          variant: 'destructive',
        });
      } else if (result.intent === 'symptom_check') {
        // Use the symptom analysis
        setSymptoms(command);
        handleSymptomAnalysis();
      } else {
        toast({
          title: 'Command Processed',
          description: `Understood: ${result.intent}`,
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: 'Error',
        description: 'Failed to process voice command.',
        variant: 'destructive',
      });
    }
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

  const handleMicClick = () => {
    if (isConnected) {
      leave();
    } else {
      join();
    }
  }

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
          How are you feeling today? Describe your symptoms below or say commands like &quot;Book an appointment for tomorrow at 4 PM&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
          <div
            onClick={handleMicClick}
            className={`absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer
              ${isConnected ? 'orb-speaking' : ''}
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
            placeholder="e.g., I have a throbbing headache and feel nauseous... OR Book an appointment for tomorrow at 4 PM for my cough"
            className="min-h-[100px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={isAnalyzing}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSymptomAnalysis}
              disabled={isAnalyzing}
            >
              <Send className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleVoiceCommand(symptoms)}
              disabled={isAnalyzing || !symptoms.trim()}
            >
              Process Command
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground justify-center">
        Powered by the agora ✨ Conversational AI Engine
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
