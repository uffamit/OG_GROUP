import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { upcomingAppointments } from '@/lib/data';
import { Calendar, Video, Hospital } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          Your scheduled consultations for the upcoming days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.map((appt) => (
              <li
                key={appt.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={appt.doctorAvatar} alt={appt.doctor} />
                    <AvatarFallback>{appt.doctor.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.specialty}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center gap-2 justify-end">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {appt.time}
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
