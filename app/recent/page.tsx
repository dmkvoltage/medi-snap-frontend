'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { ResultsDisplay } from '@/components/results-display';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, FileText, Upload } from 'lucide-react';
import { getInterpretations, askQuestion, InterpretationResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function RecentResultsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [results, setResults] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?message=Please sign in to view your results');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMostRecent = async () => {
        try {
          setLoading(true);
          // Get the most recent interpretation (page 1, limit 1)
          const response = await getInterpretations({ page: 1, limit: 1 });
          if (response.data && response.data.length > 0) {
            setResults(response.data[0]);
          } else {
            setError('No recent analyses found. Upload a document to get started.');
          }
        } catch (err) {
          console.error('Failed to fetch recent results:', err);
          setError('Failed to load recent results');
        } finally {
          setLoading(false);
        }
      };

      fetchMostRecent();
    }
  }, [isAuthenticated]);

  const handleAskQuestion = useCallback(
    async (question: string) => {
      if (!results) {
        console.error('No results available for chat');
        return;
      }

      console.log('Asking question:', question, 'for interpretation:', results.id);
      setAsking(true);
      try {
        const response = await askQuestion(results.id, question, language);
        console.log('Chat response:', response);
        return response.answer;
      } catch (err) {
        console.error('Q&A Error:', err);
        throw err;
      } finally {
        setAsking(false);
      }
    },
    [results, language]
  );

  const handleNewDocument = useCallback(() => {
    router.push('/upload');
  }, [router]);

  if (authLoading || loading) {
    return (
      <PageShell
        title="Loading Recent Results"
        description="Retrieving your most recent analysis..."
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
        title="Recent Results"
        description="Your most recent document analysis"
        language={language}
        onLanguageChange={setLanguage}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'No recent results found.'}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>What you can do:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('/upload')} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload a New Document
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                View All History
              </Button>
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
      title="Recent Results"
      description={`Your most recent analysis: ${results.document_type} (${Math.round(results.confidence * 100)}% confidence)`}
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
        />

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Upload className="h-8 w-8 text-primary mx-auto" />
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
                <FileText className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium">View History</h3>
                <p className="text-sm text-muted-foreground">
                  See all your past analyses
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/dashboard')}>
                  View All Results
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <ArrowLeft className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium">Back to Home</h3>
                <p className="text-sm text-muted-foreground">
                  Return to the main page
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/')}>
                  Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}