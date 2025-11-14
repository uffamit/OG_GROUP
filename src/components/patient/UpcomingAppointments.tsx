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
import { Button } from '../ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useMemoFirebase } from '@/firebase/index';
import { firestore } from '@/firebase/index';
import { collection, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Appointment {
  id: string;
  doctorId: string;
  appointmentTime: any; // Firestore Timestamp
  reason: string;
  status: string;
  type: string;
  agoraChannelId: string;
  createdAt?: any; // Firestore Timestamp
}

export function UpcomingAppointments() {
  const { user } = useUser();

  // Create a memoized query for appointments
  const appointmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'appointments'),
      where('patientId', '==', user.uid),
      where('status', '==', 'upcoming'),
      orderBy('appointmentTime', 'asc')
    );
  }, [user]);

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
          <p className="text-center text-muted-foreground py-8">Loading appointments...</p>
        ) : appointments && appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appt, index) => {
              const appointmentDate = appt.appointmentTime?.toDate ? appt.appointmentTime.toDate() : new Date(appt.appointmentTime);
              // Check if appointment was created recently (within last 5 seconds)
              const createdAt = appt.createdAt?.toDate ? appt.createdAt.toDate() : null;
              const isNew = createdAt && (Date.now() - createdAt.getTime()) < 5000;
              
              return (
                <li
                  key={appt.id}
                  className={`flex items-center justify-between p-3 bg-secondary/50 rounded-lg transition-all ${
                    isNew ? 'animate-pulse border-2 border-primary shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src={`https://picsum.photos/seed/doc-${appt.doctorId}/100/100`} alt="Doctor" />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Dr. Demo</p>
                      <p className="text-sm text-muted-foreground">
                        {appt.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-medium flex items-center gap-2 justify-end">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {appointmentDate.toLocaleString()}
                    </p>
                    <div className="flex gap-2 items-center justify-end">
                      <Badge
                        variant={appt.type === 'Virtual' ? 'default' : 'secondary'}
                      >
                        {appt.type === 'Virtual' ? (
                          <Video className="mr-1 h-3 w-3" />
                        ) : (
                          <Hospital className="mr-1 h-3 w-3" />
                        )}
                        {appt.type}
                      </Badge>
                      <Button asChild size="sm">
                        <Link href={`/call/${appt.id}`}>
                          Join Call
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No upcoming appointments. Use the voice assistant to book one!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
