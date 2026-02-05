'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { ResultsDisplay } from '@/components/results-display';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, FileText, MessageCircle, Download } from 'lucide-react';
import { getInterpretation, askQuestion, InterpretationResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const interpretationId = searchParams.get('id');

  const [results, setResults] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [defaultTab, setDefaultTab] = useState('summary');

  useEffect(() => {
    // Check URL hash for default tab
    if (typeof window !== 'undefined' && window.location.hash === '#chat') {
      setDefaultTab('chat');
    }
  }, []);

  useEffect(() => {
    if (!interpretationId) {
      setError('No interpretation ID provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getInterpretation(interpretationId);
        setResults(data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [interpretationId]);

  const handleAskQuestion = useCallback(
    async (question: string) => {
      if (!results) {
        console.error('[ResultsPage] No results available for chat');
        return 'No results available for chat';
      }

      console.log('[ResultsPage] Asking question:', question);
      console.log('[ResultsPage] Results ID:', results.id);
      console.log('[ResultsPage] Language:', language);

      setAsking(true);
      try {
        console.log('[ResultsPage] Calling askQuestion API...');
        const response = await askQuestion(results.id, question, language);
        console.log('[ResultsPage] API response received:', response);
        console.log('[ResultsPage] Response type:', typeof response);
        
        // Ensure we return a string
        if (response && response.answer && typeof response.answer === 'string') {
          console.log('[ResultsPage] Returning answer:', response.answer);
          return response.answer;
        } else {
          console.error('[ResultsPage] Invalid response format:', response);
          return 'Sorry, I received an invalid response. Please try asking your question again.';
        }
      } catch (err) {
        console.error('[ResultsPage] Q&A Error:', err);
        return 'Sorry, I encountered an error. Please try again.';
      } finally {
        setAsking(false);
      }
    },
    [results, language]
  );

  const handleNewDocument = useCallback(() => {
    router.push('/upload');
  }, [router]);

  if (loading) {
    return (
      <PageShell
        title="Loading Results"
        description="Retrieving your interpretation..."
        language={language}
        onLanguageChange={setLanguage}
      >
        <LoadingState />
      </PageShell>
    );
  }

  if (error || !results) {
    return (
      <PageShell
        title="Results Not Found"
        description="Unable to load the interpretation results"
        language={language}
        onLanguageChange={setLanguage}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'The requested interpretation could not be found.'}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>What you can do:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('/upload')} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Upload a New Document
              </Button>
              {isAuthenticated && (
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                  View Your History
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Results: ${results.document_type}`}
      description={`Interpretation completed with ${Math.round(results.confidence * 100)}% confidence`}
      language={language}
      onLanguageChange={setLanguage}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Display */}
        <ResultsDisplay
          results={results}
          onNewDocument={handleNewDocument}
          onAsking={handleAskQuestion}
          isAsking={asking}
          defaultTab={defaultTab}
        />

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium">Upload Another</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze a new medical document
                </p>
                <Button onClick={handleNewDocument} size="sm" className="w-full">
                  New Document
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <MessageCircle className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium">Ask Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Get clarifications via chat
                </p>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Available in Actions Tab
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Download className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium">Save Results</h3>
                <p className="text-sm text-muted-foreground">
                  Download as PDF or text
                </p>
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push(`/interpret/${results.id}`)}
                  >
                    View in Dashboard
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Login to Save
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          {isAuthenticated && (
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              View All Results
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
