'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { LoadingState } from '@/components/loading-state';
import { useAuth } from '@/lib/auth-context';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interpretationId = searchParams.get('id');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace('/login?message=Please sign in to access chat');
      return;
    }

    // Redirect to results page with chat tab
    if (interpretationId) {
      router.replace(`/results?id=${interpretationId}#chat`);
      return;
    }

    router.replace('/recent#chat');
  }, [authLoading, interpretationId, isAuthenticated, router]);

  return (
    <PageShell
      title="Redirecting to Chat"
      description="Taking you to the chat interface..."
    >
      <LoadingState />
    </PageShell>
  );
}
