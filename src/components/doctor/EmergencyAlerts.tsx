'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyAlert {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: 'active' | 'resolved';
  location: string;
  reason: string;
}

export function EmergencyAlerts() {
  const firestore = useFirestore();
  
  const emergencyAlertsQuery = useMemoFirebase(
    () => query(
      collection(firestore, 'emergencyAlerts'),
      where('status', '==', 'active'),
      orderBy('timestamp', 'desc'),
      limit(5)
    ),
    [firestore]
  );

  const { data: alerts, isLoading, error } = useCollection<EmergencyAlert>(emergencyAlertsQuery);

  const handleResolve = async (alertId: string) => {
    try {
      const alertRef = doc(firestore, 'emergencyAlerts', alertId);
      await updateDoc(alertRef, { status: 'resolved' });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Emergency Alerts
          </CardTitle>
          <CardDescription>Loading active emergency alerts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail if there's an error
  }

  if (!alerts || alerts.length === 0) {
    return null; // Don't show the card if there are no active alerts
  }

  return (
    <Card className="border-destructive bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
          Emergency Alerts
          <Badge variant="destructive" className="ml-auto">
            {alerts.length} Active
          </Badge>
        </CardTitle>
        <CardDescription>Real-time emergency notifications from patients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant="destructive" className="relative pr-12">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">
              {alert.patientName}
            </AlertTitle>
            <AlertDescription className="text-sm space-y-1">
              <p>{alert.reason}</p>
              <p className="text-xs opacity-80">
                {alert.timestamp 
                  ? formatDistanceToNow(new Date(alert.timestamp.seconds * 1000), { addSuffix: true })
                  : 'Just now'}
              </p>
              {alert.location !== 'Unknown' && (
                <p className="text-xs opacity-80">Location: {alert.location}</p>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => handleResolve(alert.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Resolve alert</span>
            </Button>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
