'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(userDoc => {
        const userRole = userDoc.exists() ? userDoc.data().role : 'patient';
        const targetPath = userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
        router.push(targetPath);
      });
    }
  }, [user, userLoading, router, firestore]);

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    
    console.log('1. Starting login with role:', role);
    setIsLoggingIn(true);

    try {
      const provider = new GoogleAuthProvider();
      console.log('2. Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      console.log('3. User signed in:', loggedInUser.uid);

      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole = role;
      if (userDoc.exists()) {
        finalRole = userDoc.data().role;
         console.log('4a. User document exists. Role is:', finalRole);
      } else {
        console.log('4b. Creating Firestore document...');
        await setDoc(userDocRef, {
          id: loggedInUser.uid,
          email: loggedInUser.email,
          name: loggedInUser.displayName,
          profileImage: loggedInUser.photoURL,
          role: finalRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          age: 0,
          phone: '',
        });
         console.log('5. Firestore document created successfully');
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${loggedInUser.displayName}! Redirecting...`,
      });
      
      const targetPath = finalRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      console.log('6. About to redirect to:', targetPath);

      router.push(targetPath);

      // Fallback redirect in case router.push fails silently
      setTimeout(() => {
        if (window.location.pathname.includes('/auth/login')) {
            console.log('7. Fallback redirect executing...');
            window.location.href = targetPath;
        }
      }, 1500);

    } catch (error: any) {
      console.error('LOGIN ERROR:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast({
        title: 'Login Failed',
        description: error.message || 'Could not log in with Google. Please try again.',
        variant: 'destructive',
      });
      setIsLoggingIn(false);
    }
  };

  const isLoading = userLoading || isLoggingIn;

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Loading...</CardTitle>
          <CardDescription>
            Please wait while we prepare your session.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </CardContent>
      </Card>
    )
  }

  // Prevents flash of login form if user object is already available
  if (user && !userLoading) {
      return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Redirecting...</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Choose your role and sign in to continue.
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
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login with Google'}
        </Button>
      </CardContent>
    </Card>
  );
}
