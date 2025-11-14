'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Video, Hospital } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  specialty: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  type: 'Virtual' | 'In-Person';
  status: string;
  reason?: string;
}

export function UpcomingAppointments() {
  const firestore = useFirestore();
  const { user } = useUser();

  const appointmentsQuery = useMemoFirebase(
    () => user ? query(
      collection(firestore, 'appointments'),
      where('patientId', '==', user.uid),
      orderBy('appointmentTime', 'asc')
    ) : null,
    [firestore, user]
  );

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          Your scheduled consultations for the upcoming days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">
            Loading appointments...
          </p>
        ) : appointments && appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <li
                key={appt.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={appt.doctorAvatar} alt={appt.doctorName} />
                    <AvatarFallback>{appt.doctorName?.charAt(0) || 'D'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{appt.doctorName || 'Dr. Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.specialty || 'General'}
                    </p>
                    {appt.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: {appt.reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center gap-2 justify-end">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {appt.appointmentTime 
                      ? format(new Date(appt.appointmentTime.seconds * 1000), 'MMM d, h:mm a')
                      : 'TBD'}
                  </p>
                  <Badge
                    variant={appt.type === 'Virtual' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {appt.type === 'Virtual' ? (
                      <Video className="mr-1 h-3 w-3" />
                    ) : (
                      <Hospital className="mr-1 h-3 w-3" />
                    )}
                    {appt.type}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No upcoming appointments.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
