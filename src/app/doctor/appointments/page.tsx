import { AppointmentQueue } from '@/components/doctor/AppointmentQueue';

export default function DoctorAppointmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your appointment schedule.
        </p>
      </div>
      <AppointmentQueue />
    </div>
  );
}
