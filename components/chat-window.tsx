'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Send, Loader2, MessageCircle, Paperclip, Image as ImageIcon, Sparkles } from 'lucide-react';
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
  interpretationId?: string;
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
  const lastInterpretationId = useRef<string | undefined>(undefined);

  // Load chat history when component mounts or interpretationId changes
  useEffect(() => {
    if (interpretationId && interpretationId !== lastInterpretationId.current) {
      lastInterpretationId.current = interpretationId;
      setHistoryLoaded(false);
      
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
          setMessages([]);
          setHistoryLoaded(true);
        } finally {
          setHistoryLoading(false);
        }
      };

      loadChatHistory();
    }
  }, [interpretationId]);

  // Auto-scroll to bottom only when new messages are added
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (scrollRef.current && messages.length > lastMessageCount.current) {
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

        let responseText = '';
        if (typeof response === 'string') {
          responseText = response;
        } else if (response && typeof response === 'object') {
          responseText = 'answer' in response ? String((response as { answer?: string }).answer || '') : String(response);
        } else if (response) {
          responseText = String(response);
        }

        console.log('[ChatWindow] Final response text:', responseText);

        if (responseText && responseText.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I received an empty response. Please try asking your question again.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('[ChatWindow] Error sending question:', error);
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
    <div className="flex flex-col gap-4 rounded-[28px] border border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-[0_12px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in-up">
      {/* Header with gradient */}
      <div className="px-5 pt-5">
        <div className="rounded-[24px] px-5 py-4 bg-gradient-to-br from-primary via-blue-500 to-cyan-500 text-white shadow-[0_10px_30px_rgba(66,133,244,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 ring-2 ring-white/40 flex items-center justify-center shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-white/80">Chat with</p>
                <p className="text-lg font-bold">Med8d AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs bg-white/20 px-3 py-1.5 rounded-full">
                <span className="h-2.5 w-2.5 rounded-full bg-green-300 animate-pulse" />
                <span className="font-medium">Online</span>
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-white/70" />
            <span className="text-sm font-medium text-white/90">General information only</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="h-64 sm:h-80 px-5 py-4 space-y-4"
      >
        <div className="space-y-4">
          {historyLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground font-medium">Loading chat history...</p>
            </div>
          )}

          {!historyLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-4 mb-4">
                <MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">Ask a question to get started</p>
              <p className="text-sm text-muted-foreground/70">Get clarifications about your medical document</p>
            </div>
          )}

          {!historyLoading && messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-sm shadow-lg shadow-primary/25'
                    : 'bg-gradient-to-br from-muted/60 to-muted/30 border border-border rounded-bl-sm'
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
                        strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="font-medium">{message.content}</span>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">You</span>
                </div>
              )}
            </div>
          ))}

          {localLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="max-w-[50px] px-4 py-3 rounded-2xl rounded-bl-sm bg-gradient-to-br from-muted/60 to-muted/30 border border-border flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {!historyLoading && messages.length === 0 && (
        <div className="px-5 pb-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, index) => (
              <button
                key={q}
                onClick={() => handleSendQuestion(q)}
                className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105 ${
                  index % 4 === 0
                    ? 'border-primary/40 text-primary hover:bg-primary/10 shadow-sm'
                    : index % 4 === 1
                    ? 'border-destructive/40 text-destructive hover:bg-destructive/10 shadow-sm'
                    : index % 4 === 2
                    ? 'border-accent/60 text-foreground hover:bg-accent/20 shadow-sm'
                    : 'border-secondary/40 text-secondary hover:bg-secondary/10 shadow-sm'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-5 border-t border-border/50">
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
              className="h-11 w-11 rounded-full border border-border/60 bg-gradient-to-br from-muted/50 to-muted hover:from-muted hover:to-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 shadow-sm"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mx-auto" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="h-11 w-11 rounded-full border border-border/60 bg-gradient-to-br from-muted/50 to-muted hover:from-muted hover:to-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 shadow-sm"
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
            className="rounded-full h-12 bg-gradient-to-br from-muted/50 to-muted border-border/60 shadow-inner focus:shadow-md transition-all duration-200"
          />
          <Button
            type="submit"
            disabled={!input.trim() || localLoading || isLoading}
            size="lg"
            className="rounded-full h-12 w-12 p-0 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
          >
            {localLoading || isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
