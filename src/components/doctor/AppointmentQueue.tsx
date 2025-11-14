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
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfDay, endOfDay } from 'date-fns';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  type: 'Virtual' | 'In-Person';
  status: string;
  reason?: string;
}

export function AppointmentQueue() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Query for today's appointments for this doctor
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const appointmentsQuery = useMemoFirebase(
    () => user ? query(
      collection(firestore, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('appointmentTime', 'asc')
    ) : null,
    [firestore, user]
  );

  const { data: allAppointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  // Filter for today's appointments client-side
  const appointments = allAppointments?.filter(appt => {
    const apptDate = new Date(appt.appointmentTime.seconds * 1000);
    return apptDate >= todayStart && apptDate <= todayEnd;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Checked In':
      case 'checked_in':
        return 'default';
      case 'Waiting':
      case 'waiting':
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
          <p className="text-center text-muted-foreground py-8">
            Loading appointments...
          </p>
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
              {appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                        <AvatarFallback>
                          {appt.patientName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{appt.patientName || 'Patient'}</span>
                        {appt.reason && (
                          <p className="text-xs text-muted-foreground">
                            {appt.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {appt.appointmentTime 
                      ? format(new Date(appt.appointmentTime.seconds * 1000), 'h:mm a')
                      : 'TBD'}
                  </TableCell>
                  <TableCell>{appt.type}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(appt.status)}>
                      {appt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No appointments scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
