export const patientData = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  age: 34,
  profileImage: 'https://picsum.photos/seed/patient1/100/100',
};

export const doctorData = {
  name: 'Dr. Evelyn Reed',
  email: 'evelyn.reed@example.com',
  specialty: 'Cardiologist',
  profileImage: 'https://picsum.photos/seed/doc1/100/100',
};

export const medications = [
  { id: 1, name: 'Lisinopril', dosage: '10mg', time: '08:00', taken: true },
  { id: 2, name: 'Atorvastatin', dosage: '20mg', time: '08:00', taken: false },
  { id: 3, name: 'Metformin', dosage: '500mg', time: '20:00', taken: false },
];

export const dailyRoutines = [
  { name: 'Wake Up', time: '07:00', progress: 100 },
  { name: 'Morning Walk', time: '30 min', progress: 75 },
  { name: 'Water Intake', time: '2L', progress: 50 },
  { name: 'Sleep', time: '8 hours', progress: 0 },
];

export const upcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Ben Carter',
    specialty: 'Dermatologist',
    time: 'Tomorrow, 10:30 AM',
    type: 'Virtual',
    doctorAvatar: 'https://picsum.photos/seed/doc2/100/100',
  },
  {
    id: 2,
    doctor: 'Dr. Chloe Davis',
    specialty: 'General Physician',
    time: 'July 25, 2024, 02:00 PM',
    type: 'In-Person',
    doctorAvatar: 'https://picsum.photos/seed/doc3/100/100',
  },
];

export const appointmentQueue = [
    { id: 1, patientName: "Sarah Johnson", time: "09:00 AM", type: "Virtual", status: "Checked In", patientAvatar: 'https://picsum.photos/seed/patient2/100/100' },
    { id: 2, patientName: "Michael Smith", time: "09:30 AM", type: "In-Person", status: "Waiting", patientAvatar: 'https://picsum.photos/seed/patient3/100/100' },
    { id: 3, patientName: "Emily Brown", time: "10:00 AM", type: "In-Person", status: "Waiting", patientAvatar: 'https://picsum.photos/seed/patient4/100/100' },
    { id: 4, patientName: "David Wilson", time: "10:30 AM", type: "Virtual", status: "Scheduled", patientAvatar: 'https://picsum.photos/seed/patient5/100/100' },
];

export const patientList = [
    { id: 1, name: "Sarah Johnson", age: 45, lastVisit: "2024-07-10", status: "Active", patientAvatar: 'https://picsum.photos/seed/patient2/100/100' },
    { id: 2, name: "Michael Smith", age: 52, lastVisit: "2024-06-22", status: "Active", patientAvatar: 'https://picsum.photos/seed/patient3/100/100' },
    { id: 3, name: "Emily Brown", age: 31, lastVisit: "2024-07-15", status: "Stable", patientAvatar: 'https://picsum.photos/seed/patient4/100/100' },
    { id: 4, name: "David Wilson", age: 68, lastVisit: "2024-05-30", status: "Monitoring", patientAvatar: 'https://picsum.photos/seed/patient5/100/100' },
];

export const patientComplianceData = [
  { month: 'Jan', adherence: Math.floor(Math.random() * 20) + 80 },
  { month: 'Feb', adherence: Math.floor(Math.random() * 20) + 75 },
  { month: 'Mar', adherence: Math.floor(Math.random() * 20) + 80 },
  { month: 'Apr', adherence: Math.floor(Math.random() * 20) + 85 },
  { month: 'May', adherence: Math.floor(Math.random() * 20) + 70 },
  { month: 'Jun', adherence: Math.floor(Math.random() * 20) + 90 },
];
