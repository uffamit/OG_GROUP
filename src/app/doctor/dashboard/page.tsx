import { AppointmentQueue } from '@/components/doctor/AppointmentQueue';
import { PatientCompliance } from '@/components/doctor/PatientCompliance';
import { PatientList } from '@/components/doctor/PatientList';
import { RealTimeAlerts } from '@/components/doctor/RealTimeAlerts';
import { EmergencyAlerts } from '@/components/doctor/EmergencyAlerts';

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      {/* Emergency alerts for immediate visibility */}
      <EmergencyAlerts />
      
      {/* Real-time alerts at the top for immediate visibility */}
      <RealTimeAlerts />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <AppointmentQueue />
        </div>
        <div className="lg:col-span-2">
          <PatientCompliance />
        </div>
      </div>
      <div>
        <PatientList />
      </div>
    </div>
  );
}
