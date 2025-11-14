'use client';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { EmergencyButton } from './EmergencyButton';

type AppLayoutProps = {
  children: ReactNode;
  userType: 'patient' | 'doctor';
};

export function AppLayout({ children, userType }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar userType={userType} />
        <main className="pl-0 md:pl-12 lg:pl-64 transition-all duration-300 ease-in-out">
          <Header />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        {userType === 'patient' && <EmergencyButton />}
      </div>
    </SidebarProvider>
  );
}
