'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageNav } from '@/components/page-nav';
import { LandingSection } from '@/components/landing-section';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Handle Get Started - redirect to login if not authenticated, upload if authenticated
  const handleGetStarted = useCallback(() => {
    if (isAuthenticated) {
      router.push('/upload');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Auto-redirect authenticated users to upload
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Don't auto-redirect, let them see the landing page
      // They can click "Get Started" to go to upload
    }
  }, [authLoading, isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-background page-transition">
      <Header language={language} onLanguageChange={setLanguage} />
      <PageNav className="mt-2" />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <LandingSection onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  );
}
