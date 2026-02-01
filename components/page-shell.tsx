'use client';

import { useState, type ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageNav } from '@/components/page-nav';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <PageNav className="mt-2" />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </header>
        {children}
      </main>

      <Footer />
    </div>
  );
}
