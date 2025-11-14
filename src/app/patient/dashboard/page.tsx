import { VoiceAssistant } from '@/components/patient/VoiceAssistant';
import { MedicationSchedule } from '@/components/patient/MedicationSchedule';
import { DailyRoutine } from '@/components/patient/DailyRoutine';
import { UpcomingAppointments } from '@/components/patient/UpcomingAppointments';

export default function PatientDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VoiceAssistant />
        </div>
        <div className="space-y-8">
          <MedicationSchedule />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <DailyRoutine />
      </div>
       <div>
          <UpcomingAppointments />
        </div>
    </div>
  );
}
