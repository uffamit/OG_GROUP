import { PatientList } from '@/components/doctor/PatientList';

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your patient list.
        </p>
      </div>
      <PatientList />
    </div>
  );
}
