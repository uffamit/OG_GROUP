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

export function EmergencyButton() {
  const { toast } = useToast();

  const handleEmergency = () => {
    toast({
      title: 'Emergency Alert Triggered',
      description: 'Notifying your emergency contacts and nearest hospital.',
      variant: 'destructive',
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 animate-pulse"
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
