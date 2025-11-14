'use client';

import { useParams } from 'next/navigation';
import { useDoc, useMemoFirebase } from '@/firebase/index';
import { firestore } from '@/firebase/index';
import { doc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import VideoCall to avoid SSR issues with Agora SDK
const VideoCall = dynamic(
  () => import('@/components/shared/VideoCall'),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-screen" /> 
  }
);

interface Appointment {
  id: string;
  agoraChannelId: string;
  patientId: string;
  doctorId: string;
  appointmentTime: any;
  reason: string;
  status: string;
}

export default function CallPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  // Create memoized document reference
  const appointmentRef = useMemoFirebase(() => {
    return doc(firestore, 'appointments', appointmentId);
  }, [appointmentId]);

  const { data: appointment, isLoading, error } = useDoc<Appointment>(appointmentRef);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Skeleton className="w-64 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading call...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Call Not Found</h1>
          <p className="text-muted-foreground">
            {error ? 'Error loading appointment' : 'Appointment does not exist'}
          </p>
        </div>
      </div>
    );
  }

  const channelName = appointment.agoraChannelId;

  return (
    <div className="w-full h-screen">
      <VideoCall channelName={channelName} appointmentId={appointmentId} />
    </div>
  );
}
