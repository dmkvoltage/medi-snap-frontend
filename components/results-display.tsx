'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Copy,
  Download,
  Share2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  RotateCcw,
  MessageCircle,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { InterpretationResponse } from '@/lib/api-client';
import { ChatWindow } from '@/components/chat-window';

interface ResultsDisplayProps {
  results: InterpretationResponse;
  onNewDocument?: () => void;
  onAsking?: (question: string) => Promise<string>;
  isAsking?: boolean;
  defaultTab?: string;
}

export function ResultsDisplay({
  results,
  onNewDocument,
  onAsking,
  isAsking = false,
  defaultTab = 'summary',
}: ResultsDisplayProps) {
  console.log('[ResultsDisplay] Component rendered/re-rendered, isAsking:', isAsking);
  
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  const handleCopy = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const medicalTerms = results.interpretation.sections.flatMap(section =>
    section.terms.map(t => ({ term: t.term, definition: t.definition, importance: t.importance }))
  );

  // Summary tab content
  const SummaryTab = () => (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 p-6 sm:p-8 shadow-lg">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 p-3 sm:p-4 flex-shrink-0 mt-1">
            <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Plain Language Summary
            </h3>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              {results.interpretation.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-5 text-center hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-center gap-1 mb-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground mb-1">Document Type</div>
          <div className="text-sm sm:text-base font-bold text-foreground truncate">
            {results.document_type}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-green-500/5 p-4 sm:p-5 text-center hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
          <div className="text-sm sm:text-base font-bold text-foreground">
            {Math.round(results.confidence * 100)}%
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-amber-500/5 p-4 sm:p-5 text-center hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-center gap-1 mb-2">
            <ArrowRight className="h-4 w-4 text-accent" />
          </div>
          <div className="text-xs text-muted-foreground mb-1">Time</div>
          <div className="text-sm sm:text-base font-bold text-foreground">
            {(results.processingTime / 1000).toFixed(2)}s
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() =>
            handleCopy(results.interpretation.summary, 'summary')
          }
          variant="outline"
          className="flex-1 rounded-full h-12 hover:bg-muted/50 transition-all duration-200"
        >
          {copiedTab === 'summary' ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" />
              <span>Copy Summary</span>
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            const text = `Document Type: ${results.document_type}\nConfidence: ${Math.round(results.confidence * 100)}%\n\n${results.interpretation.summary}`;
            const element = document.createElement('a');
            element.setAttribute(
              'href',
              'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
            );
            element.setAttribute('download', 'medical-interpretation.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          variant="outline"
          className="flex-1 rounded-full h-12 hover:bg-muted/50 transition-all duration-200"
        >
          <Download className="mr-2 h-5 w-5" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );

  // Details tab content
  const DetailsTab = () => (
    <div className="space-y-4">
      {results.interpretation.sections.map((section, index) => (
        <Card
          key={index}
          className={`
            rounded-2xl border border-border/60 overflow-hidden
            transition-all duration-300
            ${expandedSections[index] ? 'shadow-lg' : 'shadow-sm'}
          `}
        >
          <button
            onClick={() => toggleSection(index)}
            className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <span className="font-bold text-base text-foreground text-left flex items-center gap-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                {index + 1}
              </span>
              Section {index + 1}
            </span>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 flex-shrink-0 ${
                expandedSections[index] ? 'rotate-180 text-primary' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {expandedSections[index] && (
            <div className="border-t border-border/60 px-5 py-5 space-y-4 bg-gradient-to-br from-muted/20 to-background">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Original
                </h4>
                <p className="text-sm text-foreground bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 font-mono leading-relaxed border border-border/50">
                  {section.original}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="h-3 w-3" />
                  Simplified
                </h4>
                <p className="text-base text-foreground leading-relaxed bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl p-4 border border-primary/10">
                  {section.simplified}
                </p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  // Terms tab content
  const TermsTab = () => (
    <div className="space-y-4">
      {medicalTerms && medicalTerms.length > 0 ? (
        medicalTerms.map((termObj, index) => (
          <Card
            key={index}
            className={`
              rounded-2xl border border-border/60 p-5
              bg-gradient-to-br from-card to-muted/20
              hover:shadow-md hover:border-primary/30
              transition-all duration-300
              card-lift
            `}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-3 flex-shrink-0 mt-1">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-foreground text-base">
                    {termObj.term}
                  </h4>
                  {termObj.importance && (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm ${
                      termObj.importance === 'high'
                        ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200'
                        : termObj.importance === 'medium'
                          ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 dark:from-amber-900/50 dark:to-amber-800/50 dark:text-amber-200'
                          : 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200'
                    }`}>
                      {termObj.importance.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
                  {termObj.definition}
                </p>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card className="rounded-2xl border border-border/60 p-10 text-center bg-gradient-to-br from-card to-muted/20">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-bold text-foreground mb-2">No medical terms found</h3>
          <p className="text-muted-foreground">This document doesn't contain complex medical terminology.</p>
        </Card>
      )}
    </div>
  );

  // Actions tab content
  const ActionsTab = () => (
    <div className="space-y-5">
      {results.interpretation.warnings && results.interpretation.warnings.length > 0 && (
        <Card className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 dark:border-red-800 p-6 shadow-lg shadow-red-200/20">
          <h3 className="font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Important Warnings</span>
          </h3>
          <ul className="space-y-3 text-sm text-red-800 dark:text-red-300">
            {results.interpretation.warnings.map((warning, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 dark:bg-red-800 text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{warning}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 shadow-lg">
        <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Next Steps</span>
        </h3>
        <ol className="space-y-4 text-base text-foreground">
          {results.interpretation.nextSteps && results.interpretation.nextSteps.length > 0 ? (
            results.interpretation.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary/25">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-1">{step}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex gap-4 items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary/25">
                  1
                </span>
                <span className="leading-relaxed pt-1">Review the plain language summary above</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary/25">
                  2
                </span>
                <span className="leading-relaxed pt-1">Use the Chat tab to ask questions for clarification</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary/25">
                  3
                </span>
                <span className="leading-relaxed pt-1">Share with your healthcare provider</span>
              </li>
            </>
          )}
        </ol>
      </Card>

      <Card className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800 p-6 shadow-lg shadow-green-200/20">
        <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Privacy Protected</span>
        </h3>
        <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
          Your document is processed securely and automatically deleted when you close this page. 
          We never store your medical information. Your data stays yours.
        </p>
      </Card>

      {onAsking && (
        <Card className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800 p-6 shadow-lg shadow-blue-200/20">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Have Questions?</span>
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed mb-4">
            Switch to the Chat tab to ask follow-up questions about your medical document in plain language.
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-lg px-4 py-3">
            <Sparkles className="h-4 w-4" />
            <span>💡 Try asking: "What should I discuss with my doctor?"</span>
          </div>
        </Card>
      )}
    </div>
  );

  // Chat tab content - memoized to prevent re-mounting
  const chatTabContent = useMemo(() => {
    console.log('[ResultsDisplay] Creating chat tab content, onAsking:', !!onAsking, 'isAsking:', isAsking);
    return (
      <div className="space-y-4">
        {onAsking ? (
          <>
            <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">Ask Questions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get clarifications about your medical document in plain language
              </p>
            </Card>
            <ChatWindow
              key={`chat-${results.id}`} // Stable key based on interpretation ID
              onSendQuestion={onAsking}
              isLoading={isAsking}
              interpretationId={results.id}
              suggestedQuestions={[
                "What do these results mean for my health?",
                "Are there any values I should be concerned about?",
                "What should I discuss with my doctor?",
                "What are the next steps I should take?",
                "Can you explain the medical terms in simpler language?",
                "Are there any lifestyle changes I should consider?"
              ]}
            />
          </>
        ) : (
          <Card className="rounded-2xl border border-border/60 p-10 text-center bg-gradient-to-br from-card to-muted/20">
            <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2 text-xl">Chat Not Available</h3>
            <p className="text-muted-foreground">
              Chat functionality is not available for this session.
            </p>
          </Card>
        )}
      </div>
    );
  }, [onAsking, results.id]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            Results
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 rounded-full text-primary font-semibold text-sm">
              {results.document_type}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-sm font-medium">
              {Math.round(results.confidence * 100)}% confidence
            </span>
          </p>
        </div>
        <Button
          onClick={onNewDocument}
          variant="outline"
          className="rounded-full h-12 px-6 gap-2 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="font-semibold">New Analysis</span>
        </Button>
      </div>

      {/* Cohesive Results Card */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <Card className="rounded-3xl border border-border/60 overflow-hidden shadow-xl">
          {/* Tab List */}
          <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-border/60 bg-gradient-to-r from-muted/30 to-transparent p-0 h-auto">
            <TabsTrigger
              value="summary"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-5 text-sm font-semibold transition-all duration-200"
            >
              <span className="hidden sm:inline">Summary</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-5 text-sm font-semibold transition-all duration-200"
            >
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Detail</span>
            </TabsTrigger>
            <TabsTrigger
              value="terms"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-5 text-sm font-semibold transition-all duration-200"
            >
              <span className="hidden sm:inline">Terms</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-5 text-sm font-semibold transition-all duration-200"
            >
              <span className="hidden sm:inline">Actions</span>
              <span className="sm:hidden">Help</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-5 text-sm font-semibold transition-all duration-200"
            >
              <span className="hidden sm:inline">Chat</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="p-5 sm:p-8">
            <TabsContent value="summary" className="mt-0 space-y-4 animate-fade-in-up">
              <SummaryTab />
            </TabsContent>
            <TabsContent value="details" className="mt-0 space-y-4 animate-fade-in-up">
              <DetailsTab />
            </TabsContent>
            <TabsContent value="terms" className="mt-0 space-y-4 animate-fade-in-up">
              <TermsTab />
            </TabsContent>
            <TabsContent value="actions" className="mt-0 animate-fade-in-up">
              <ActionsTab />
            </TabsContent>
            <TabsContent value="chat" className="mt-0 animate-fade-in-up">
              {chatTabContent}
            </TabsContent>
          </div>
        </Card>
      </Tabs>

      {/* Action Buttons - Bottom */}
      <div className="flex gap-3 sm:gap-4 flex-wrap">
        <Button
          onClick={() => handleCopy(results.interpretation.summary, 'summary')}
          variant="outline"
          className="flex-1 rounded-full h-12 gap-2 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          {copiedTab === 'summary' ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              <span className="font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">Copy</span>
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            const text = `Document Type: ${results.document_type}\nConfidence: ${Math.round(results.confidence * 100)}%\n\n${results.interpretation.summary}`;
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', 'medical-interpretation.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          variant="outline"
          className="flex-1 rounded-full h-12 gap-2 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Download</span>
        </Button>
        <Button
          onClick={() => {
            const text = `Document Type: ${results.document_type}\nConfidence: ${Math.round(results.confidence * 100)}%\n\n${results.interpretation.summary}`;
            if (navigator.share) {
              navigator.share({
                title: 'Medical Document Translation',
                text: text,
              });
            } else {
              handleCopy(text, 'share');
            }
          }}
          variant="outline"
          className="flex-1 rounded-full h-12 gap-2 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Share</span>
        </Button>
      </div>
    </div>
  );
}
