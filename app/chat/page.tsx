'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { LoadingState } from '@/components/loading-state';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interpretationId = searchParams.get('id');

  useEffect(() => {
    // Redirect to results page with chat tab
    if (interpretationId) {
      router.replace(`/results?id=${interpretationId}#chat`);
    } else {
      router.replace('/');
    }
  }, [interpretationId, router]);

  return (
    <PageShell
      title="Redirecting to Chat"
      description="Taking you to the chat interface..."
    >
      <LoadingState />
    </PageShell>
  );
}
