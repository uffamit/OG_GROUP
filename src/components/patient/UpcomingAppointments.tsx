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
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { appointmentsCollection, Appointment } from '@/lib/firestore-helpers';
import { query, where, orderBy } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function UpcomingAppointments() {
  const { user } = useUser();
  const router = useRouter();

  const appointmentsQuery = useMemoFirebase(
    user
      ? query(
          appointmentsCollection,
          where('patientId', '==', user.uid),
          where('status', '==', 'scheduled'),
          orderBy('appointmentTime', 'asc')
        )
      : null,
    [user?.uid]
  );

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  const handleJoinCall = (appointmentId: string) => {
    router.push(`/call/${appointmentId}`);
  };

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
            {appointments.map((appt) => {
              const appointmentDate = new Date(appt.appointmentTime);
              const formattedTime = format(appointmentDate, 'MMM d, yyyy, h:mm a');
              
              return (
                <li
                  key={appt.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src="https://picsum.photos/seed/doc1/100/100" alt="Doctor" />
                      <AvatarFallback>Dr</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Dr. Demo</p>
                      <p className="text-sm text-muted-foreground">
                        General Physician
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formattedTime}
                    </p>
                    <div className="flex items-center gap-2">
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
                      {appt.type === 'Virtual' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinCall(appt.id!)}
                        >
                          Join Call
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
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
