import { AppLayout } from '@/components/shared/AppLayout';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout userType="doctor">{children}</AppLayout>;
}
