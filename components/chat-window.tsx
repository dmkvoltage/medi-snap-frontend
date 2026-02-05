'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Send, Loader2, MessageCircle, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { getChatHistory } from '@/lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  onSendQuestion: (question: string) => Promise<string>;
  isLoading?: boolean;
  suggestedQuestions?: string[];
  interpretationId?: string; // Add this to load chat history
}

export function ChatWindow({
  onSendQuestion,
  isLoading = false,
  interpretationId,
  suggestedQuestions = [
    'What does this mean?',
    'What are the risks?',
    'What next?',
  ],
}: ChatWindowProps) {
  console.log('[ChatWindow] Component rendered/re-rendered for interpretation:', interpretationId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const lastInterpretationId = useRef<string | undefined>();

  // Load chat history when component mounts or interpretationId changes
  useEffect(() => {
    if (interpretationId && interpretationId !== lastInterpretationId.current) {
      lastInterpretationId.current = interpretationId;
      setHistoryLoaded(false); // Reset history loaded state for new interpretation
      
      const loadChatHistory = async () => {
        console.log('[ChatWindow] Loading chat history for:', interpretationId);
        setHistoryLoading(true);
        try {
          const { messages: historyMessages } = await getChatHistory(interpretationId);
          console.log('[ChatWindow] Chat history loaded:', historyMessages);
          const formattedMessages: Message[] = historyMessages.map((msg, index) => ({
            id: msg.id || `history-${index}`,
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));
          console.log('[ChatWindow] Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
          setHistoryLoaded(true);
        } catch (error) {
          console.error('[ChatWindow] Failed to load chat history:', error);
          // Don't show error to user, just start with empty chat
          setMessages([]); // Ensure we start with empty messages on error
          setHistoryLoaded(true); // Mark as loaded even on error to prevent retry loops
        } finally {
          setHistoryLoading(false);
        }
      };

      loadChatHistory();
    }
  }, [interpretationId]); // Remove historyLoaded from dependencies

  // Auto-scroll to bottom only when new messages are added (not when scrolling up)
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (scrollRef.current && messages.length > lastMessageCount.current) {
      // Only auto-scroll if we're near the bottom (within 100px) or if it's the first load
      const scrollElement = scrollRef.current;
      const isNearBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 100;
      
      if (isNearBottom || lastMessageCount.current === 0) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages]);

  const handleSendQuestion = useCallback(
    async (question: string) => {
      if (!question.trim() || localLoading || isLoading) return;

      console.log('[ChatWindow] Sending question:', question);
      setLocalLoading(true);
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput('');

      try {
        console.log('[ChatWindow] Calling onSendQuestion...');
        const response = await onSendQuestion(question);
        console.log('[ChatWindow] Raw response received:', response);
        console.log('[ChatWindow] Response type:', typeof response);

        // Ensure we have a valid response
        if (!response) {
          console.error('[ChatWindow] Received null/undefined response');
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I received no response. Please try asking your question again.',
          };
          setMessages((prev) => [...prev, errorMessage]);
          return;
        }

        // Handle different response types
        let responseText = '';
        if (typeof response === 'string') {
          responseText = response;
          console.log('[ChatWindow] Response is string:', responseText);
        } else if (response && typeof response === 'object' && 'answer' in response) {
          responseText = String(response.answer || '');
          console.log('[ChatWindow] Response has answer property:', responseText);
        } else if (response) {
          responseText = String(response);
          console.log('[ChatWindow] Response converted to string:', responseText);
        }

        console.log('[ChatWindow] Final response text:', responseText);
        console.log('[ChatWindow] Response text length:', responseText.length);

        if (responseText && responseText.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
          };
          console.log('[ChatWindow] Adding assistant message:', assistantMessage);
          setMessages((prev) => {
            const newMessages = [...prev, assistantMessage];
            console.log('[ChatWindow] New messages array:', newMessages);
            return newMessages;
          });
        } else {
          console.error('[ChatWindow] Empty response text, response was:', response);
          // Add error message to chat
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I received an empty response. Please try asking your question again.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('[ChatWindow] Error sending question:', error);
        // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLocalLoading(false);
      }
    },
    [localLoading, isLoading, onSendQuestion]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuestion(input);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((file) => file.name).join(', ');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: `Shared file(s): ${names}`,
        },
      ]);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-border bg-background shadow-[0_12px_36px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header (inspired by the reference image, Google-branded palette) */}
      <div className="px-4 sm:px-5 pt-4">
        <div className="rounded-[22px] px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-br from-primary via-sky-500 to-cyan-500 text-white shadow-[0_10px_26px_rgba(66,133,244,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 ring-2 ring-white/40 flex items-center justify-center">
                <span className="text-sm font-semibold">MS</span>
              </div>
              <div className="leading-tight">
                <p className="text-xs text-white/80">Chat with</p>
                <p className="text-sm sm:text-base font-semibold">MediSnap AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                Online
              </span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
            <span className="text-[10px] sm:text-xs">General info only</span>
          </div>
        </div>
      </div>
      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="h-64 sm:h-80 px-4 sm:px-5 py-4 space-y-3"
      >
        <div className="space-y-3">
          {historyLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-2xl bg-primary/10 p-3 mb-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">
                Loading chat history...
              </p>
            </div>
          )}

          {!historyLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-2xl bg-primary/10 p-3 mb-3">
                <MessageCircle className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask a question to get started
              </p>
            </div>
          )}

          {!historyLoading && messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none shadow-[0_8px_18px_rgba(66,133,244,0.25)]'
                    : 'bg-muted/40 border border-border text-foreground rounded-bl-none'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 last:mb-0 list-disc list-inside">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 last:mb-0 list-decimal list-inside">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {localLoading && (
            <div className="flex gap-3 justify-start">
              <div className="max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl bg-background border border-border rounded-bl-none">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {!historyLoading && messages.length === 0 && (
        <div className="px-4 sm:px-5 pb-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Quick Questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, index) => (
              <button
                key={q}
                onClick={() => handleSendQuestion(q)}
                className={`text-xs px-3 py-2 rounded-full border transition-all ${
                  index % 4 === 0
                    ? 'border-primary/40 text-primary hover:bg-primary/10'
                    : index % 4 === 1
                    ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
                    : index % 4 === 2
                    ? 'border-accent/60 text-foreground hover:bg-accent/20'
                    : 'border-secondary/40 text-secondary hover:bg-secondary/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mx-auto" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Attach image"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mx-auto" aria-hidden="true" />
            </button>
          </div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={localLoading || isLoading}
            className="rounded-full h-11 bg-background border-border"
          />
          <Button
            type="submit"
            disabled={!input.trim() || localLoading || isLoading}
            size="sm"
            className="rounded-full h-11 w-11 p-0 bg-primary hover:bg-primary/90 shadow-[0_10px_20px_rgba(66,133,244,0.35)]"
          >
            {localLoading || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
