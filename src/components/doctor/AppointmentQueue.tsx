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
import { appointmentQueue } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export function AppointmentQueue() {
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
            {appointmentQueue.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                      <AvatarFallback>
                        {appt.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{appt.patientName}</span>
                  </div>
                </TableCell>
                <TableCell>{appt.time}</TableCell>
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
      </CardContent>
    </Card>
  );
}
