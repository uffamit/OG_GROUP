import { firestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, CollectionReference } from 'firebase/firestore';

export interface Appointment {
  id?: string;
  patientId: string;
  doctorId: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'Virtual' | 'In-Person';
  createdAt?: any;
}

export interface EmergencyAlert {
  id?: string;
  patientId: string;
  symptoms: string;
  timestamp?: any;
  status: 'active' | 'resolved';
}

export const appointmentsCollection = collection(firestore, 'appointments') as CollectionReference;
export const alertsCollection = collection(firestore, 'alerts') as CollectionReference;

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(appointmentsCollection, {
      ...appointment,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...appointment };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(alertsCollection, {
      ...alert,
      timestamp: serverTimestamp(),
    });
    return { id: docRef.id, ...alert };
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    throw error;
  }
}
