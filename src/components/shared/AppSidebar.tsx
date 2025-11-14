'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import {
  Bell,
  Calendar,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Settings,
  Stethoscope,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AppSidebarProps = {
  userType: 'patient' | 'doctor';
};

const patientNavItems = [
  { href: '/patient/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/patient/medications', icon: <Pill />, label: 'Medications' },
  { href: '/patient/appointments', icon: <Calendar />, label: 'Appointments' },
  { href: '/patient/doctors', icon: <Stethoscope />, label: 'Find Doctors' },
];

const doctorNavItems = [
  { href: '/doctor/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/doctor/patients', icon: <Users />, label: 'Patients' },
  { href: '/doctor/appointments', icon: <Calendar />, label: 'Appointments' },
  { href: '/doctor/prescriptions', icon: <Pill />, label: 'Prescriptions' },
];

const bottomNavItems = [
  { href: '/notifications', icon: <Bell />, label: 'Notifications' },
  { href: '/settings', icon: <Settings />, label: 'Settings' },
];

export function AppSidebar({ userType }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = userType === 'patient' ? patientNavItems : doctorNavItems;

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="h-16 flex items-center justify-center gap-2">
        <Logo className="w-8 h-8 text-primary" />
        <span
          data-sidebar="brand-name"
          className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden"
        >
          AgoraMedAI
        </span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side:'right' }}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarContent className="p-2 mt-auto">
         <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
