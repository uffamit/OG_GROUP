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
import { Input } from '../ui/input';
import { Mic, Send, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
import { analyzeSymptoms, AnalyzeSymptomsOutput } from '@/ai/flows/voice-assistant-symptom-analysis';
import { summarizeCall } from '@/ai/flows/summarize-call';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useAgora } from '@/hooks/use-agora';
import { useUser } from '@/firebase/auth/use-user';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '@/firebase';

export function VoiceAssistant() {
  const { user } = useUser();
  const channelName = user ? `voice-assistant-${user.uid}` : '';
  const { isConnected, join, leave, callSummary, clearSummary } = useAgora(channelName, user?.uid ?? null);
  const [symptoms, setSymptoms] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    keyPoints: string[];
    symptomsDiscussed: string[];
    actionItems: string[];
    overallSummary: string;
  } | null>(null);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const { toast } = useToast();

  // Handle call summary when available
  useEffect(() => {
    if (callSummary && callSummary.transcript) {
      setIsProcessingSummary(true);
      summarizeCall({ transcript: callSummary.transcript })
        .then((summary) => {
          setSummaryData(summary);
          setIsSummaryDialogOpen(true);
          speak('Your call has ended. I have prepared a summary for you.');
        })
        .catch((error) => {
          console.error('Failed to summarize call:', error);
          toast({
            title: 'Summary Failed',
            description: 'Could not generate call summary.',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsProcessingSummary(false);
          clearSummary();
        });
    }
  }, [callSummary, clearSummary, toast]);

  // Text-to-Speech function
  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSymptomAnalysis = (symptomsText?: string) => {
    const textToAnalyze = symptomsText || symptoms;
    if (!textToAnalyze.trim()) {
      toast({
        title: 'No symptoms entered',
        description: 'Please describe your symptoms before analyzing.',
        variant: 'destructive',
      });
      speak('Please describe your symptoms before analyzing.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await analyzeSymptoms({
          symptomsDescription: textToAnalyze,
        });
        setAnalysisResult(result);
        setIsDialogOpen(true);
        
        // Voice feedback based on urgency
        if (result.urgencyLevel === 'high') {
          speak(`Urgent attention needed. ${result.recommendations}`);
          // Trigger emergency alert for high urgency
          if (user) {
            await addDoc(collection(firestore, 'alerts'), {
              patientId: user.uid,
              type: 'HIGH_URGENCY_SYMPTOM',
              urgencyLevel: result.urgencyLevel,
              symptoms: textToAnalyze,
              diagnoses: result.diagnosisSuggestions,
              timestamp: new Date(),
            });
          }
        } else if (result.urgencyLevel === 'medium') {
          speak(`Your symptoms have been analyzed. Moderate urgency detected. ${result.recommendations}`);
        } else {
          speak(`Your symptoms have been analyzed. Low urgency. ${result.recommendations}`);
        }
        
        toast({
          title: 'Analysis Complete',
          description: `Urgency Level: ${result.urgencyLevel}`,
        });
      } catch (error) {
        speak('Could not analyze symptoms. Please try again.');
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

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleSymptomAnalysis(manualInput);
      setManualInput('');
    }
  };

  const handleEmergency = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to trigger an emergency alert.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'alerts'), {
        patientId: user.uid,
        type: 'EMERGENCY',
        timestamp: new Date(),
        symptoms: symptoms || 'Emergency button pressed',
      });
      speak('Emergency alert sent to medical staff.');
      toast({
        title: 'Emergency Alert Sent',
        description: 'Medical staff has been notified.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert.',
        variant: 'destructive',
      });
    }
  };

  const handleMicClick = () => {
    if (isConnected) {
      leave();
      speak('Voice assistant disconnected.');
    } else {
      join();
      speak('Voice assistant connected. How can I help you today?');
    }
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
          How are you feeling today? Describe your symptoms below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
          <div
            onClick={handleMicClick}
            className={`absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer transition-all
              ${isConnected ? 'orb-speaking' : ''}
              ${isAnalyzing ? 'orb-listening' : ''}
            `}
          >
            <div className="w-32 h-32 rounded-full bg-primary/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                {isAnalyzing ? (
                  <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
                ) : (
                  <Mic className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4">
          <Textarea
            placeholder="e.g., I have a throbbing headache and feel nauseous..."
            className="min-h-[100px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button
            className="w-full"
            onClick={() => handleSymptomAnalysis()}
            disabled={isAnalyzing}
          >
            <Send className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
          </Button>
          
          {/* Manual Text Input Fallback */}
          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Or type a quick command..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAnalyzing) {
                  handleManualSubmit();
                }
              }}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button
              onClick={handleManualSubmit}
              disabled={isAnalyzing || !manualInput.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Emergency Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleEmergency}
            disabled={isAnalyzing}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Emergency Alert
          </Button>
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

      {/* Call Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Summary</DialogTitle>
            <DialogDescription>
              Here's a summary of your conversation with the AI assistant.
            </DialogDescription>
          </DialogHeader>
          {isProcessingSummary ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generating summary...</span>
            </div>
          ) : summaryData ? (
            <div className="space-y-6 py-4">
              <div>
                <h4 className="font-semibold mb-3 text-lg">Overall Summary</h4>
                <p className="text-sm text-muted-foreground">{summaryData.overallSummary}</p>
              </div>
              
              {summaryData.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Points</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {summaryData.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {summaryData.symptomsDiscussed.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Symptoms Discussed</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {summaryData.symptomsDiscussed.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {summaryData.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {summaryData.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setIsSummaryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
