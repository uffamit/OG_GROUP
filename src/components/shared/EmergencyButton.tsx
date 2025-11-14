'use client';

import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { createEmergencyAlert } from '@/lib/firestore-helpers';
import { useState } from 'react';

export function EmergencyButton() {
  const { toast } = useToast();
  const { user } = useUser();
  const [isTriggering, setIsTriggering] = useState(false);

  const handleEmergency = async () => {
    setIsTriggering(true);
    try {
      await createEmergencyAlert({
        patientId: user?.uid || 'demo-patient-id',
        symptoms: 'Emergency button pressed - immediate assistance required',
        status: 'active',
      });

      toast({
        title: '🔴 Emergency Alert Triggered',
        description: 'Notifying your emergency contacts and nearest hospital.',
        variant: 'destructive',
      });

      // TTS feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Emergency alert has been sent. Help is on the way.'
        );
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
      toast({
        title: 'Error',
        description: 'Could not trigger emergency alert. Please call 911.',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 animate-pulse"
          disabled={isTriggering}
        >
          <HeartPulse className="h-8 w-8" />
          <span className="sr-only">Emergency</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Emergency</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately notify your emergency contacts and dispatch help
            to your current location. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEmergency}>
            Confirm Emergency
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
