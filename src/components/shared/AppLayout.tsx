'use client';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { EmergencyButton } from './EmergencyButton';
import { ScrollArea } from '@/components/ui/scroll-area';

type AppLayoutProps = {
  children: ReactNode;
  userType: 'patient' | 'doctor';
};

export function AppLayout({ children, userType }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar userType={userType} />
        <div className="flex flex-col flex-1 overflow-hidden pl-0 md:pl-12 lg:pl-64 transition-all duration-300 ease-in-out">
          <Header />
          <ScrollArea className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </ScrollArea>
        </div>
        {userType === 'patient' && <EmergencyButton />}
      </div>
    </SidebarProvider>
  );
}
