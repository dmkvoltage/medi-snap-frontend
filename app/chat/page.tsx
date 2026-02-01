'use client';

import { PageShell } from '@/components/page-shell';
import { ChatWindow } from '@/components/chat-window';

export default function ChatPage() {
  return (
    <PageShell
      title="Ask Follow-up Questions"
      description="Chat with MediSnap for quick clarifications about your document."
    >
      <ChatWindow onSendQuestion={() => undefined} />
    </PageShell>
  );
}
