'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  HeartPulse,
  Mic,
  Stethoscope,
  User,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';

const features = [
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'AI Voice Assistant',
    description: 'Manage schedules, analyze symptoms, and more, using just your voice.',
  },
  {
    icon: <Activity className="h-8 w-8 text-primary" />,
    title: 'Medication Management',
    description: 'Track your medications, set reminders, and monitor your adherence in real-time.',
  },
  {
    icon: <Stethoscope className="h-8 w-8 text-primary" />,
    title: 'Doctor Booking',
    description: 'Easily find and book appointments with specialists near you.',
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-primary" />,
    title: 'Emergency Services',
    description: 'One-tap access to emergency contacts, services, and nearby hospitals.',
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    title: 'Patient Management',
    description: 'Doctors can view patient summaries, medical history, and track progress.',
  },
  {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: 'Virtual Consultations',
    description: 'Connect with your doctor from the comfort of your home via video call.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  const handlePatientLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', 'patient');
      router.push('/patient/dashboard');
    }
  };

  const handleDoctorLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', 'doctor');
      router.push('/doctor/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              AgoraMedAI
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground font-headline">
              Your Health, Connected.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              AgoraMedAI is a comprehensive healthcare platform that puts you in
              control. Seamlessly manage your health with AI-powered assistance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={handlePatientLogin} size="lg" className="font-semibold">
                  Enter as Patient
                </Button>
                <Button onClick={handleDoctorLogin} size="lg" variant="secondary" className="font-semibold">
                  Enter as Doctor
                </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                A New Era of Healthcare
              </h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                Discover the powerful features designed to simplify your healthcare journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/70 border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                        <p className="mt-1 text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 bg-background">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AgoraMedAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
