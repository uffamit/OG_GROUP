'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { appointmentsCollection, Appointment, alertsCollection, EmergencyAlert } from '@/lib/firestore-helpers';
import { query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function AppointmentQueue() {
  const appointmentsQuery = useMemoFirebase(
    query(
      appointmentsCollection,
      where('doctorId', '==', 'dr-demo-id'),
      where('status', '==', 'scheduled'),
      orderBy('appointmentTime', 'asc'),
      limit(10)
    ),
    []
  );

  const alertsQuery = useMemoFirebase(
    query(
      alertsCollection,
      where('status', '==', 'active'),
      orderBy('timestamp', 'desc'),
      limit(5)
    ),
    []
  );

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);
  const { data: alerts } = useCollection<EmergencyAlert>(alertsQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {alerts && alerts.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>🔴 NEW EMERGENCY ALERT</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-2 bg-destructive/10 rounded">
                  <p className="font-semibold">Patient ID: {alert.patientId}</p>
                  <p className="text-sm">Symptoms: {alert.symptoms}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.timestamp && format(new Date(alert.timestamp.toDate()), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Appointment Queue</CardTitle>
          <CardDescription>
            Patients scheduled for consultation today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading appointments...</p>
          ) : appointments && appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => {
                  const appointmentDate = new Date(appt.appointmentTime);
                  const formattedTime = format(appointmentDate, 'h:mm a');

                  return (
                    <TableRow key={appt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="https://picsum.photos/seed/patient1/100/100" alt="Patient" />
                            <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Patient {appt.patientId.substring(0, 8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formattedTime}</TableCell>
                      <TableCell>{appt.type}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusVariant(appt.status)}>
                          {appt.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No appointments scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
