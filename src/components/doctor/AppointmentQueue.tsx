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
import { useCollection, useMemoFirebase } from '@/firebase/index';
import { firestore } from '@/firebase/index';
import { collection, query, where, orderBy } from 'firebase/firestore';

interface Appointment {
  id: string;
  patientId: string;
  appointmentTime: any; // Firestore Timestamp
  reason: string;
  status: string;
  type: string;
}

export function AppointmentQueue() {
  // Query appointments for the dummy doctor
  const appointmentsQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, 'appointments'),
      where('doctorId', '==', 'dr-demo-id'),
      where('status', '==', 'upcoming'),
      orderBy('appointmentTime', 'asc')
    );
  }, []);

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Checked In':
        return 'default';
      case 'Waiting':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
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
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => {
                const appointmentDate = appt.appointmentTime?.toDate ? appt.appointmentTime.toDate() : new Date(appt.appointmentTime);
                return (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://picsum.photos/seed/patient-${appt.patientId}/100/100`} alt="Patient" />
                          <AvatarFallback>
                            PT
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Patient #{appt.patientId.substring(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appointmentDate.toLocaleTimeString()}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
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
            No appointments in the queue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
