'use client';

import { PageShell } from '@/components/page-shell';
import { LoadingState } from '@/components/loading-state';

export default function Loading() {
  return (
    <PageShell
      title="Processing"
      description="A branded loading experience shown while your document is analyzed."
    >
      <LoadingState />
    </PageShell>
  );
}
