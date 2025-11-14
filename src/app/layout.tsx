import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore } from '@/firebase/index';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'AgoraMedAI - Complete Healthcare Platform',
  description:
    'A complete, production-ready healthcare management platform with real-time features, voice AI integration, and multi-role support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('font-sans antialiased')}>
        <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
          {children}
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
