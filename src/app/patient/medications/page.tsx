import { MedicationSchedule } from '@/components/patient/MedicationSchedule';

export default function MedicationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
        <p className="text-muted-foreground mt-2">
          Manage your medication schedule and set reminders.
        </p>
      </div>
      <MedicationSchedule />
    </div>
  );
}
