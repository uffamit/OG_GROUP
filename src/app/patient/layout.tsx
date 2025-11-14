import { AppLayout } from '@/components/shared/AppLayout';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout userType="patient">{children}</AppLayout>;
}
