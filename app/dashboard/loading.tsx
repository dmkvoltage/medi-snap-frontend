import { PageShell } from '@/components/page-shell';
import { LoadingState } from '@/components/loading-state';

export default function DashboardLoading() {
  return (
    <PageShell title="Dashboard" description="Loading your history...">
      <LoadingState />
    </PageShell>
  );
}
