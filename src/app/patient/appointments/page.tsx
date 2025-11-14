import { UpcomingAppointments } from '@/components/patient/UpcomingAppointments';

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your upcoming appointments.
        </p>
      </div>
      <UpcomingAppointments />
    </div>
  );
}
