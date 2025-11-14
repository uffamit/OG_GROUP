'use client';

import { useMemo } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemoFirebase } from '@/firebase/provider';

interface AlertData {
  id: string;
  patientId: string;
  type: string;
  urgencyLevel?: string;
  symptoms?: string;
  diagnoses?: string[];
  timestamp: Timestamp | Date;
}

export function RealTimeAlerts() {
  // Listen to alerts from the last 5 minutes
  const fiveMinutesAgo = useMemo(() => new Date(Date.now() - 5 * 60 * 1000), []);
  
  const alertsQuery = useMemoFirebase(() => {
    const alertsRef = collection(firestore, 'alerts');
    return query(
      alertsRef,
      where('timestamp', '>', fiveMinutesAgo),
      orderBy('timestamp', 'desc')
    );
  }, [fiveMinutesAgo]);

  const { data: alerts, isLoading } = useCollection<AlertData>(alertsQuery);

  if (isLoading) {
    return null;
  }

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {alerts.map((alert) => {
        const isEmergency = alert.type === 'EMERGENCY';
        const isHighUrgency = alert.urgencyLevel === 'high';
        const variant = isEmergency || isHighUrgency ? 'destructive' : 'default';

        return (
          <Alert key={alert.id} variant={variant} className="animate-pulse">
            <div className="flex items-start gap-2">
              {isEmergency || isHighUrgency ? (
                <AlertTriangle className="h-5 w-5 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2 mb-2">
                  {isEmergency ? '🔴 EMERGENCY ALERT' : '⚠️ HIGH URGENCY ALERT'}
                  {alert.urgencyLevel && (
                    <Badge variant={variant}>
                      {alert.urgencyLevel.toUpperCase()}
                    </Badge>
                  )}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Patient ID: {alert.patientId.slice(0, 8)}...</p>
                    {alert.symptoms && (
                      <p className="text-sm">Symptoms: {alert.symptoms}</p>
                    )}
                    {alert.diagnoses && alert.diagnoses.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium">Potential diagnoses:</p>
                        <ul className="list-disc list-inside ml-2">
                          {alert.diagnoses.map((diagnosis, idx) => (
                            <li key={idx}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {alert.timestamp instanceof Date
                        ? alert.timestamp.toLocaleTimeString()
                        : alert.timestamp.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
