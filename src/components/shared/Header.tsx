'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth } from '@/firebase';

function getTitle(pathname: string): string {
  if (pathname.includes('/doctor')) {
    if (pathname.endsWith('/dashboard')) return "Doctor's Dashboard";
    if (pathname.includes('/patients')) return 'Patient Management';
    if (pathname.includes('/appointments')) return 'Appointment Schedule';
    return 'Doctor Portal';
  }
  if (pathname.includes('/patient')) {
    if (pathname.endsWith('/dashboard')) return "Patient's Dashboard";
    if (pathname.includes('/medications')) return 'Medication Management';
    if (pathname.includes('/appointments')) return 'Your Appointments';
    return 'Patient Portal';
  }
  return 'AgoraMedAI';
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const title = getTitle(pathname);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/auth/login');
    }
  };
  
  const userInitial = user?.displayName?.charAt(0) || 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
