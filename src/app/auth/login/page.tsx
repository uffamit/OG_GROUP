'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  const handleDummyLogin = () => {
    const targetPath = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    router.push(targetPath);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Choose your role to view the demo dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RadioGroup defaultValue="patient" onValueChange={(value: 'patient' | 'doctor') => setRole(value)} className='mb-4'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="patient" id="patient" />
              <Label htmlFor="patient">I am a Patient</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doctor" id="doctor" />
              <Label htmlFor="doctor">I am a Doctor</Label>
            </div>
          </RadioGroup>
        <Button
          className="w-full"
          onClick={handleDummyLogin}
        >
          View Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
