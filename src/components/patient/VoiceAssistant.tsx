'use client';
import {
  Card,
  CardContent,
  CardDescription,
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

export function VoiceAssistant() {
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [isAnalyzing, startTransition] = useTransition();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
    setIsListening(prev => !prev);
    if(isSpeaking) setIsSpeaking(false);
    // Placeholder for real voice logic
    if(!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000)
      }, 3000)
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
        <CardTitle>AI Voice Assistant</CardTitle>
        <CardDescription>
          How are you feeling today? Describe your symptoms below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
          <div 
            onClick={handleMicClick}
            className={`absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer
              ${isListening ? 'orb-listening' : ''}
              ${isSpeaking ? 'orb-speaking' : ''}
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
            placeholder="e.g., I have a throbbing headache and feel nauseous..."
            className="min-h-[100px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button
            className="w-full"
            onClick={handleSymptomAnalysis}
            disabled={isAnalyzing}
          >
            <Send className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
          </Button>
        </div>
      </CardContent>

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
